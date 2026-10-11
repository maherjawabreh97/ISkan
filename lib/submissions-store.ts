import crypto from "node:crypto"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import type { Submission, SubmissionInput, SubmissionStatus } from "./submissions"

/**
 * Durable store for visitor-submitted listings ("list your property" form).
 *
 * Backed by a Cloudflare **D1** database bound as `SUBMISSIONS_DB` (see
 * wrangler.jsonc + d1/submissions-schema.sql). Submitted listings sit in a
 * moderation queue here and are only published after an admin approves them.
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

interface SubmissionRow {
  id: string
  status: string
  ip: string
  created_at: number
  updated_at: number
  data: string
}

function rowToSubmission(row: SubmissionRow): Submission | null {
  try {
    const parsed = JSON.parse(row.data) as Submission
    return {
      ...parsed,
      id: row.id,
      status: row.status as SubmissionStatus,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      ip: row.ip,
      userAgent: parsed.userAgent ?? "",
    }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// In-memory fallback
// ---------------------------------------------------------------------------

const memSubmissions = new Map<string, Submission>()
let memUploads: { ip: string; at: number }[] = []

// ---------------------------------------------------------------------------
// Public API — submissions
// ---------------------------------------------------------------------------

export async function createSubmission(
  input: SubmissionInput,
  meta: { ip: string; userAgent?: string },
): Promise<Submission> {
  const now = Date.now()
  const submission: Submission = {
    ...input,
    id: crypto.randomUUID(),
    status: "pending",
    createdAt: now,
    updatedAt: now,
    ip: normalizeIp(meta.ip),
    userAgent: meta.userAgent ?? "",
  }

  const db = getDb()
  if (db) {
    await db
      .prepare(
        `INSERT INTO submissions (id, status, ip, created_at, updated_at, data)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        submission.id,
        submission.status,
        submission.ip,
        submission.createdAt,
        submission.updatedAt,
        JSON.stringify(submission),
      )
      .run()
    return submission
  }

  memSubmissions.set(submission.id, submission)
  return submission
}

export async function listSubmissions(limit = 200): Promise<Submission[]> {
  const db = getDb()
  if (db) {
    const result = await db
      .prepare(
        `SELECT id, status, ip, created_at, updated_at, data
         FROM submissions ORDER BY created_at DESC LIMIT ?`,
      )
      .bind(limit)
      .all<SubmissionRow>()
    return (result.results ?? [])
      .map(rowToSubmission)
      .filter((item): item is Submission => item !== null)
  }
  return [...memSubmissions.values()]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit)
}

export async function getSubmission(id: string): Promise<Submission | null> {
  const db = getDb()
  if (db) {
    const row = await db
      .prepare(
        `SELECT id, status, ip, created_at, updated_at, data
         FROM submissions WHERE id = ?`,
      )
      .bind(id)
      .first<SubmissionRow>()
    return row ? rowToSubmission(row) : null
  }
  return memSubmissions.get(id) ?? null
}

export async function setSubmissionStatus(
  id: string,
  status: SubmissionStatus,
  reviewedSlug?: string,
): Promise<boolean> {
  const existing = await getSubmission(id)
  if (!existing) return false

  const updated: Submission = {
    ...existing,
    status,
    updatedAt: Date.now(),
    reviewedAt: Date.now(),
    reviewedSlug: reviewedSlug ?? existing.reviewedSlug,
  }

  const db = getDb()
  if (db) {
    const result = await db
      .prepare(
        `UPDATE submissions SET status = ?, updated_at = ?, data = ?
         WHERE id = ?`,
      )
      .bind(updated.status, updated.updatedAt, JSON.stringify(updated), id)
      .run()
    return Boolean(result.success)
  }

  memSubmissions.set(id, updated)
  return true
}

export async function deleteSubmission(id: string): Promise<boolean> {
  const db = getDb()
  if (db) {
    const result = await db
      .prepare("DELETE FROM submissions WHERE id = ?")
      .bind(id)
      .run()
    return Boolean(result.success)
  }
  return memSubmissions.delete(id)
}

/** Number of submissions from an IP inside the time window (abuse control). */
export async function countRecentSubmissions(
  ip: string,
  windowMs: number,
): Promise<number> {
  const key = normalizeIp(ip)
  const since = Date.now() - windowMs
  const db = getDb()
  if (db) {
    const row = await db
      .prepare(
        `SELECT COUNT(*) AS count FROM submissions
         WHERE ip = ? AND created_at >= ?`,
      )
      .bind(key, since)
      .first<{ count: number }>()
    return row?.count ?? 0
  }
  return [...memSubmissions.values()].filter(
    (item) => item.ip === key && item.createdAt >= since,
  ).length
}

export async function pendingSubmissionCount(): Promise<number> {
  const db = getDb()
  if (db) {
    const row = await db
      .prepare("SELECT COUNT(*) AS count FROM submissions WHERE status = 'pending'")
      .first<{ count: number }>()
    return row?.count ?? 0
  }
  return [...memSubmissions.values()].filter((item) => item.status === "pending")
    .length
}

// ---------------------------------------------------------------------------
// Image-upload rate limiting
// ---------------------------------------------------------------------------

const UPLOAD_EVENT_TTL_MS = 2 * 60 * 60 * 1000

export async function recordUploads(ip: string, n: number): Promise<void> {
  const key = normalizeIp(ip)
  const now = Date.now()
  const db = getDb()
  if (db) {
    await db.batch([
      db
        .prepare("INSERT INTO upload_events (ip, n, at) VALUES (?, ?, ?)")
        .bind(key, Math.max(1, n), now),
      db
        .prepare("DELETE FROM upload_events WHERE at < ?")
        .bind(now - UPLOAD_EVENT_TTL_MS),
    ])
    return
  }
  memUploads.push({ ip: key, at: now })
  memUploads = memUploads.filter((item) => item.at >= now - UPLOAD_EVENT_TTL_MS)
}

export async function countRecentUploads(
  ip: string,
  windowMs: number,
): Promise<number> {
  const key = normalizeIp(ip)
  const since = Date.now() - windowMs
  const db = getDb()
  if (db) {
    const row = await db
      .prepare(
        "SELECT COALESCE(SUM(n), 0) AS count FROM upload_events WHERE ip = ? AND at >= ?",
      )
      .bind(key, since)
      .first<{ count: number }>()
    return row?.count ?? 0
  }
  return memUploads
    .filter((item) => item.ip === key && item.at >= since)
    .reduce((total) => total + 1, 0)
}
