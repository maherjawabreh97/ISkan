import crypto from "node:crypto"
import { getCloudflareContext } from "@opennextjs/cloudflare"

/**
 * Owner credentials for visitor-submitted listings.
 *
 * When an advertiser posts a listing they choose a password. We hand them a
 * short "manage code" which, together with that password, lets them take the
 * listing down again once the property has been rented or sold — without
 * needing an admin account.
 *
 * Only the scrypt hash of the password is ever stored, and the code is the only
 * lookup key. Records live in Cloudflare D1 (`SUBMISSIONS_DB`).
 *
 * While a submission is still awaiting moderation the key is `pending:<id>`;
 * `moveManagerToSlug` re-points it to the real slug once an admin approves it.
 */

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
    const db = (ctx?.env as Record<string, unknown> | undefined)?.SUBMISSIONS_DB
    if (db && typeof (db as D1Database).prepare === "function") {
      return db as D1Database
    }
  } catch {
    // Not running inside a Cloudflare Worker (dev build, tests, ...).
  }
  return null
}

function normalizeIp(ip: string): string {
  return (ip || "unknown").trim().toLowerCase().replace(/^::ffff:/, "")
}

export interface ListingManager {
  slug: string
  manageCode: string
  submissionId?: string
  createdAt: number
}

interface ManagerRow {
  slug: string
  manage_code: string
  password_hash: string
  submission_id: string | null
  created_at: number
}

// ---------------------------------------------------------------------------
// In-memory fallback (local dev / builds)
// ---------------------------------------------------------------------------

const memManagers = new Map<string, { row: ManagerRow }>()
let memAttempts: { ip: string; at: number }[] = []

// ---------------------------------------------------------------------------
// Password + code helpers
// ---------------------------------------------------------------------------

export function hashListingPassword(
  password: string,
  salt = crypto.randomBytes(16).toString("hex"),
): string {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

export function verifyListingPassword(
  password: string,
  stored: string,
): boolean {
  const [salt, hash] = stored.split(":")
  if (!salt || !hash) return false
  const computed = crypto.scryptSync(password, salt, 64)
  const expected = Buffer.from(hash, "hex")
  if (computed.length !== expected.length) return false
  return crypto.timingSafeEqual(computed, expected)
}

/** Readable code such as `K7F2-9QX4` — easier to dictate over the phone. */
export function generateManageCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const pick = (count: number) =>
    Array.from({ length: count }, () =>
      alphabet[crypto.randomInt(alphabet.length)],
    ).join("")
  return `${pick(4)}-${pick(4)}`
}

/** Codes are case-insensitive and the dash is cosmetic. */
export function normalizeManageCode(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "")
}

function isValidCode(code: string): boolean {
  return /^[A-Z0-9]{8}$/.test(code)
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function registerListingManager(input: {
  slug: string
  manageCode: string
  password: string
  submissionId?: string
}): Promise<ListingManager> {
  const code = normalizeManageCode(input.manageCode)
  if (!isValidCode(code)) throw new Error("invalid manage code")

  const row: ManagerRow = {
    slug: input.slug,
    manage_code: code,
    password_hash: hashListingPassword(input.password),
    submission_id: input.submissionId ?? null,
    created_at: Date.now(),
  }

  const db = getDb()
  if (db) {
    await db
      .prepare(
        `INSERT INTO listing_managers (slug, manage_code, password_hash, submission_id, created_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(slug) DO UPDATE SET
           manage_code = excluded.manage_code,
           password_hash = excluded.password_hash,
           submission_id = excluded.submission_id`,
      )
      .bind(row.slug, row.manage_code, row.password_hash, row.submission_id, row.created_at)
      .run()
  } else {
    memManagers.set(row.slug, { row })
  }

  return {
    slug: row.slug,
    manageCode: code,
    submissionId: row.submission_id ?? undefined,
    createdAt: row.created_at,
  }
}

export async function findManagerByCode(
  code: string,
): Promise<ListingManager | null> {
  const normalized = normalizeManageCode(code)
  if (!isValidCode(normalized)) return null

  const db = getDb()
  if (db) {
    const row = await db
      .prepare(
        `SELECT slug, manage_code, password_hash, submission_id, created_at
         FROM listing_managers WHERE manage_code = ?`,
      )
      .bind(normalized)
      .first<ManagerRow>()
    if (!row) return null
    return {
      slug: row.slug,
      manageCode: row.manage_code,
      submissionId: row.submission_id ?? undefined,
      createdAt: row.created_at,
    }
  }

  for (const { row } of memManagers.values()) {
    if (row.manage_code === normalized) {
      return {
        slug: row.slug,
        manageCode: row.manage_code,
        submissionId: row.submission_id ?? undefined,
        createdAt: row.created_at,
      }
    }
  }
  return null
}

/**
 * Verify a code + password pair. Returns the matching manager on success.
 * The comparison is constant-time for the password hash.
 */
export async function verifyListingManager(
  code: string,
  password: string,
): Promise<ListingManager | null> {
  const normalized = normalizeManageCode(code)
  if (!isValidCode(normalized) || !password) return null

  const db = getDb()
  if (db) {
    const row = await db
      .prepare(
        `SELECT slug, manage_code, password_hash, submission_id, created_at
         FROM listing_managers WHERE manage_code = ?`,
      )
      .bind(normalized)
      .first<ManagerRow>()
    if (!row) return null
    if (!verifyListingPassword(password, row.password_hash)) return null
    return {
      slug: row.slug,
      manageCode: row.manage_code,
      submissionId: row.submission_id ?? undefined,
      createdAt: row.created_at,
    }
  }

  for (const { row } of memManagers.values()) {
    if (row.manage_code !== normalized) continue
    if (!verifyListingPassword(password, row.password_hash)) continue
    return {
      slug: row.slug,
      manageCode: row.manage_code,
      submissionId: row.submission_id ?? undefined,
      createdAt: row.created_at,
    }
  }
  return null
}

/** Called when an admin approves a submission and it becomes a real slug. */
export async function moveManagerToSlug(
  fromSlug: string,
  toSlug: string,
): Promise<void> {
  const db = getDb()
  if (db) {
    await db
      .prepare(
        `UPDATE listing_managers SET slug = ? WHERE slug = ?`,
      )
      .bind(toSlug, fromSlug)
      .run()
    return
  }
  const entry = memManagers.get(fromSlug)
  if (entry) {
    memManagers.delete(fromSlug)
    memManagers.set(toSlug, { row: { ...entry.row, slug: toSlug } })
  }
}

export async function deleteListingManager(slug: string): Promise<void> {
  const db = getDb()
  if (db) {
    await db.prepare("DELETE FROM listing_managers WHERE slug = ?").bind(slug).run()
    return
  }
  memManagers.delete(slug)
}

// ---------------------------------------------------------------------------
// Rate limiting for the public manage page
// ---------------------------------------------------------------------------

const ATTEMPT_WINDOW_MS = 60 * 60 * 1000

export async function recordManageAttempt(ip: string): Promise<void> {
  const key = normalizeIp(ip)
  const now = Date.now()
  const db = getDb()
  if (db) {
    await db.batch([
      db
        .prepare("INSERT INTO manage_attempts (ip, at) VALUES (?, ?)")
        .bind(key, now),
      db
        .prepare("DELETE FROM manage_attempts WHERE at < ?")
        .bind(now - ATTEMPT_WINDOW_MS),
    ])
    return
  }
  memAttempts.push({ ip: key, at: now })
  memAttempts = memAttempts.filter((item) => item.at >= now - ATTEMPT_WINDOW_MS)
}

export async function countRecentManageAttempts(ip: string): Promise<number> {
  const key = normalizeIp(ip)
  const since = Date.now() - ATTEMPT_WINDOW_MS
  const db = getDb()
  if (db) {
    const row = await db
      .prepare("SELECT COUNT(*) AS count FROM manage_attempts WHERE ip = ? AND at >= ?")
      .bind(key, since)
      .first<{ count: number }>()
    return row?.count ?? 0
  }
  return memAttempts.filter((item) => item.ip === key && item.at >= since).length
}

/** Slug used for a submission that has not been published yet. */
export function pendingManagerSlug(submissionId: string): string {
  return `pending:${submissionId}`
}

export function isPendingSlug(slug: string): boolean {
  return slug.startsWith("pending:")
}

export function submissionIdFromSlug(slug: string): string {
  return slug.replace(/^pending:/, "")
}
