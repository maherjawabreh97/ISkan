import { getCloudflareContext } from "@opennextjs/cloudflare"

/**
 * Durable store for login protection: failed-attempt counters, IP bans and a
 * small security event log.
 *
 * Backed by a Cloudflare **D1** database bound as `SECURITY_DB` (see
 * wrangler.jsonc + d1/security-schema.sql). D1 was chosen over KV because it is
 * strongly consistent — a KV counter can lag by up to a minute, which is
 * unacceptable when counting brute-force attempts.
 *
 * When the binding is unavailable (local dev, `next build`, or any non-Worker
 * runtime) it transparently falls back to an in-process implementation so the
 * app never crashes.
 */

// ---------------------------------------------------------------------------
// D1 abstraction
// ---------------------------------------------------------------------------

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  first<T = Record<string, unknown>>(colName?: string): Promise<T | null>
  run(): Promise<{ success: boolean; meta?: { changes?: number } }>
  all<T = Record<string, unknown>>(): Promise<{ results: T[]; success: boolean }>
}

interface D1Database {
  prepare(query: string): D1PreparedStatement
  batch(statements: D1PreparedStatement[]): Promise<Array<{ success: boolean }>>
}

function getDb(): D1Database | null {
  try {
    const ctx = getCloudflareContext()
    const db = (ctx?.env as Record<string, unknown> | undefined)?.SECURITY_DB
    if (db && typeof (db as D1Database).prepare === "function") {
      return db as D1Database
    }
  } catch {
    // Not running inside a Cloudflare Worker (dev build, tests, ...).
  }
  return null
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const FAIL_WINDOW_MS = 60 * 60 * 1000 // failures older than 1h are forgotten
const EVENT_TTL_MS = 30 * 24 * 60 * 60 * 1000 // keep the log for 30 days
const PERMANENT_MS = 10 * 365 * 24 * 60 * 60 * 1000
const DEFAULT_BAN_HOURS = 24

/** Wrong attempts allowed before an IP is banned (default: 3). */
export function maxLoginFailures(): number {
  const value = Number(process.env.ADMIN_MAX_LOGIN_FAILURES)
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 3
}

/** Ban duration in milliseconds. `ADMIN_BAN_HOURS=0` means permanent. */
function banDurationMs(): number {
  const raw = process.env.ADMIN_BAN_HOURS
  if (raw === undefined || raw === "") return DEFAULT_BAN_HOURS * 3600 * 1000
  const hours = Number(raw)
  if (!Number.isFinite(hours)) return DEFAULT_BAN_HOURS * 3600 * 1000
  if (hours <= 0) return PERMANENT_MS
  return Math.round(hours * 3600 * 1000)
}

export function banDurationSeconds(): number {
  return Math.round(banDurationMs() / 1000)
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BanRecord {
  ip: string
  reason: string
  at: number
  until: number
  username?: string
  userAgent?: string
}

export type SecurityEventType =
  | "login_success"
  | "login_failure"
  | "ip_banned"
  | "ip_unbanned"
  | "bot_blocked"
  | "manage_failed"
  | "listing_removed"
  | "account_activated"
  | "account_suspended"
  | "account_deleted"

export interface SecurityEvent {
  type: SecurityEventType
  ip: string
  at: number
  username?: string
  userAgent?: string
  detail?: string
}

export interface AttemptInfo {
  reason: string
  username?: string
  userAgent?: string
}

interface BanRow {
  ip: string
  reason: string
  at: number
  until: number
  username: string | null
  userAgent: string | null
}

interface EventRow {
  type: string
  ip: string
  at: number
  username: string | null
  userAgent: string | null
  detail: string | null
}

export function normalizeIp(ip: string): string {
  return (ip || "unknown").trim().toLowerCase().replace(/^::ffff:/, "")
}

function toBan(row: BanRow): BanRecord {
  return {
    ip: row.ip,
    reason: row.reason,
    at: row.at,
    until: row.until,
    username: row.username ?? undefined,
    userAgent: row.userAgent ?? undefined,
  }
}

function toEvent(row: EventRow): SecurityEvent {
  return {
    type: row.type as SecurityEventType,
    ip: row.ip,
    at: row.at,
    username: row.username ?? undefined,
    userAgent: row.userAgent ?? undefined,
    detail: row.detail ?? undefined,
  }
}

// ---------------------------------------------------------------------------
// In-memory fallback
// ---------------------------------------------------------------------------

const memFailures = new Map<string, { count: number; updatedAt: number }>()
const memBans = new Map<string, BanRecord>()
let memEvents: SecurityEvent[] = []

// ---------------------------------------------------------------------------
// Failures
// ---------------------------------------------------------------------------

export async function getFailureCount(ip: string): Promise<number> {
  const key = normalizeIp(ip)
  const db = getDb()
  if (db) {
    const row = await db
      .prepare(
        "SELECT count FROM login_failures WHERE ip = ? AND updated_at >= ?",
      )
      .bind(key, Date.now() - FAIL_WINDOW_MS)
      .first<{ count: number }>()
    return row?.count ?? 0
  }
  const entry = memFailures.get(key)
  if (!entry || entry.updatedAt < Date.now() - FAIL_WINDOW_MS) return 0
  return entry.count
}

export async function recordFailure(
  ip: string,
  info: { username?: string; userAgent?: string },
): Promise<{ count: number; banned: boolean }> {
  const key = normalizeIp(ip)
  const now = Date.now()
  let count: number

  const db = getDb()
  if (db) {
    await db
      .prepare(
        `INSERT INTO login_failures (ip, count, updated_at)
         VALUES (?, 1, ?)
         ON CONFLICT(ip) DO UPDATE SET
           count = CASE WHEN login_failures.updated_at < ? THEN 1 ELSE login_failures.count + 1 END,
           updated_at = excluded.updated_at`,
      )
      .bind(key, now, now - FAIL_WINDOW_MS)
      .run()
    const row = await db
      .prepare("SELECT count FROM login_failures WHERE ip = ?")
      .bind(key)
      .first<{ count: number }>()
    count = row?.count ?? 1
  } else {
    const entry = memFailures.get(key)
    if (!entry || entry.updatedAt < now - FAIL_WINDOW_MS) {
      count = 1
    } else {
      count = entry.count + 1
    }
    memFailures.set(key, { count, updatedAt: now })
  }

  if (count >= maxLoginFailures()) {
    await banIp(ip, {
      reason: "too_many_failures",
      username: info.username,
      userAgent: info.userAgent,
    })
    return { count, banned: true }
  }
  return { count, banned: false }
}

export async function clearFailures(ip: string): Promise<void> {
  const key = normalizeIp(ip)
  const db = getDb()
  if (db) {
    await db.prepare("DELETE FROM login_failures WHERE ip = ?").bind(key).run()
    return
  }
  memFailures.delete(key)
}

// ---------------------------------------------------------------------------
// Bans
// ---------------------------------------------------------------------------

export async function getBan(ip: string): Promise<BanRecord | null> {
  const key = normalizeIp(ip)
  const db = getDb()
  if (db) {
    const row = await db
      .prepare(
        `SELECT ip, reason, at, until, username, user_agent AS userAgent
         FROM bans WHERE ip = ?`,
      )
      .bind(key)
      .first<BanRow>()
    if (!row) return null
    if (row.until && row.until < Date.now()) {
      await db.prepare("DELETE FROM bans WHERE ip = ?").bind(key).run()
      return null
    }
    return toBan(row)
  }
  const record = memBans.get(key)
  if (!record) return null
  if (record.until && record.until < Date.now()) {
    memBans.delete(key)
    return null
  }
  return record
}

export async function banIp(ip: string, info: AttemptInfo): Promise<BanRecord> {
  const key = normalizeIp(ip)
  const now = Date.now()
  const record: BanRecord = {
    ip: key,
    reason: info.reason,
    at: now,
    until: now + banDurationMs(),
    username: info.username,
    userAgent: info.userAgent,
  }

  const db = getDb()
  if (db) {
    await db
      .prepare(
        `INSERT INTO bans (ip, reason, at, until, username, user_agent)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(ip) DO UPDATE SET
           reason = excluded.reason,
           at = excluded.at,
           until = excluded.until,
           username = excluded.username,
           user_agent = excluded.user_agent`,
      )
      .bind(
        record.ip,
        record.reason,
        record.at,
        record.until,
        record.username ?? null,
        record.userAgent ?? null,
      )
      .run()
    return record
  }

  memBans.set(key, record)
  return record
}

export async function unbanIp(ip: string): Promise<boolean> {
  const key = normalizeIp(ip)
  const db = getDb()
  if (db) {
    const existing = await db
      .prepare("SELECT ip FROM bans WHERE ip = ?")
      .bind(key)
      .first<{ ip: string }>()
    await db.batch([
      db.prepare("DELETE FROM bans WHERE ip = ?").bind(key),
      db.prepare("DELETE FROM login_failures WHERE ip = ?").bind(key),
    ])
    return Boolean(existing)
  }
  const existed = memBans.delete(key)
  memFailures.delete(key)
  return existed
}

export async function listBans(limit = 100): Promise<BanRecord[]> {
  const db = getDb()
  if (db) {
    const now = Date.now()
    await db.prepare("DELETE FROM bans WHERE until <= ?").bind(now).run()
    const result = await db
      .prepare(
        `SELECT ip, reason, at, until, username, user_agent AS userAgent
         FROM bans ORDER BY at DESC LIMIT ?`,
      )
      .bind(limit)
      .all<BanRow>()
    return (result.results ?? []).map(toBan)
  }
  const now = Date.now()
  for (const [key, record] of memBans) {
    if (record.until <= now) memBans.delete(key)
  }
  return [...memBans.values()].sort((a, b) => b.at - a.at).slice(0, limit)
}

// ---------------------------------------------------------------------------
// Event log (newest first)
// ---------------------------------------------------------------------------

export async function logEvent(event: SecurityEvent): Promise<void> {
  const db = getDb()
  if (db) {
    await db
      .prepare(
        `INSERT INTO security_events (type, ip, at, username, user_agent, detail)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        event.type,
        normalizeIp(event.ip),
        event.at,
        event.username ?? null,
        event.userAgent ?? null,
        event.detail ?? null,
      )
      .run()
    await db
      .prepare("DELETE FROM security_events WHERE at < ?")
      .bind(event.at - EVENT_TTL_MS)
      .run()
    return
  }
  memEvents.unshift(event)
  if (memEvents.length > 500) memEvents = memEvents.slice(0, 500)
}

export async function listEvents(limit = 50): Promise<SecurityEvent[]> {
  const db = getDb()
  if (db) {
    const result = await db
      .prepare(
        `SELECT type, ip, at, username, user_agent AS userAgent, detail
         FROM security_events ORDER BY at DESC LIMIT ?`,
      )
      .bind(limit)
      .all<EventRow>()
    return (result.results ?? []).map(toEvent)
  }
  return memEvents.slice(0, limit)
}
