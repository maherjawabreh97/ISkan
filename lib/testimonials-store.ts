import crypto from "node:crypto"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import type { Testimonial, TestimonialInput, TestimonialStatus } from "./testimonials"

/**
 * Durable store for visitor-submitted testimonials.
 *
 * Backed by the same Cloudflare **D1** database as the listing queue
 * (bound as `SUBMISSIONS_DB`, see wrangler.jsonc +
 * d1/submissions-schema.sql). Testimonials stay hidden from the public
 * site until an admin approves them.
 *
 * When the binding is unavailable (local dev, `next build`, or any
 * non-Worker runtime) it transparently falls back to an in-process
 * implementation so the app never crashes.
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

interface TestimonialRow {
  id: string
  status: string
  ip: string
  created_at: number
  updated_at: number
  data: string
}

function rowToTestimonial(row: TestimonialRow): Testimonial | null {
  try {
    const parsed = JSON.parse(row.data) as Testimonial
    return {
      ...parsed,
      id: row.id,
      status: row.status as TestimonialStatus,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      ip: row.ip,
    }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// In-memory fallback
// ---------------------------------------------------------------------------

const memTestimonials = new Map<string, Testimonial>()

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function createTestimonial(
  input: TestimonialInput,
  meta: { ip: string },
): Promise<Testimonial> {
  const now = Date.now()
  const testimonial: Testimonial = {
    ...input,
    id: crypto.randomUUID(),
    status: "pending",
    createdAt: now,
    updatedAt: now,
    ip: normalizeIp(meta.ip),
  }

  const db = getDb()
  if (db) {
    await db
      .prepare(
        `INSERT INTO testimonials (id, status, ip, created_at, updated_at, data)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        testimonial.id,
        testimonial.status,
        testimonial.ip,
        testimonial.createdAt,
        testimonial.updatedAt,
        JSON.stringify(testimonial),
      )
      .run()
    return testimonial
  }

  memTestimonials.set(testimonial.id, testimonial)
  return testimonial
}

export async function listTestimonials(limit = 200): Promise<Testimonial[]> {
  const db = getDb()
  if (db) {
    const result = await db
      .prepare(
        `SELECT id, status, ip, created_at, updated_at, data
         FROM testimonials ORDER BY created_at DESC LIMIT ?`,
      )
      .bind(limit)
      .all<TestimonialRow>()
    return (result.results ?? [])
      .map(rowToTestimonial)
      .filter((item): item is Testimonial => item !== null)
  }
  return [...memTestimonials.values()]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit)
}

/** Testimonials visible on the public site (approved only). */
export async function listApprovedTestimonials(
  limit = 20,
): Promise<Testimonial[]> {
  const db = getDb()
  if (db) {
    const result = await db
      .prepare(
        `SELECT id, status, ip, created_at, updated_at, data
         FROM testimonials WHERE status = 'approved'
         ORDER BY created_at DESC LIMIT ?`,
      )
      .bind(limit)
      .all<TestimonialRow>()
    return (result.results ?? [])
      .map(rowToTestimonial)
      .filter((item): item is Testimonial => item !== null)
  }
  return [...memTestimonials.values()]
    .filter((item) => item.status === "approved")
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit)
}

export async function getTestimonial(id: string): Promise<Testimonial | null> {
  const db = getDb()
  if (db) {
    const row = await db
      .prepare(
        `SELECT id, status, ip, created_at, updated_at, data
         FROM testimonials WHERE id = ?`,
      )
      .bind(id)
      .first<TestimonialRow>()
    return row ? rowToTestimonial(row) : null
  }
  return memTestimonials.get(id) ?? null
}

export async function setTestimonialStatus(
  id: string,
  status: TestimonialStatus,
): Promise<boolean> {
  const existing = await getTestimonial(id)
  if (!existing) return false

  const updated: Testimonial = {
    ...existing,
    status,
    updatedAt: Date.now(),
  }

  const db = getDb()
  if (db) {
    const result = await db
      .prepare(
        `UPDATE testimonials SET status = ?, updated_at = ?, data = ?
         WHERE id = ?`,
      )
      .bind(updated.status, updated.updatedAt, JSON.stringify(updated), id)
      .run()
    return Boolean(result.success)
  }

  memTestimonials.set(id, updated)
  return true
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  const db = getDb()
  if (db) {
    const result = await db
      .prepare("DELETE FROM testimonials WHERE id = ?")
      .bind(id)
      .run()
    return Boolean(result.success)
  }
  return memTestimonials.delete(id)
}

/** Number of testimonials from an IP inside the time window (abuse control). */
export async function countRecentTestimonials(
  ip: string,
  windowMs: number,
): Promise<number> {
  const key = normalizeIp(ip)
  const since = Date.now() - windowMs
  const db = getDb()
  if (db) {
    const row = await db
      .prepare(
        `SELECT COUNT(*) AS count FROM testimonials
         WHERE ip = ? AND created_at >= ?`,
      )
      .bind(key, since)
      .first<{ count: number }>()
    return row?.count ?? 0
  }
  return [...memTestimonials.values()].filter(
    (item) => item.ip === key && item.createdAt >= since,
  ).length
}

export async function pendingTestimonialCount(): Promise<number> {
  const db = getDb()
  if (db) {
    const row = await db
      .prepare("SELECT COUNT(*) AS count FROM testimonials WHERE status = 'pending'")
      .first<{ count: number }>()
    return row?.count ?? 0
  }
  return [...memTestimonials.values()].filter(
    (item) => item.status === "pending",
  ).length
}
