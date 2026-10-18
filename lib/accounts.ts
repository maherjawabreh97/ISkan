import crypto from "node:crypto"
import { getCloudflareContext } from "@opennextjs/cloudflare"

/**
 * Public advertiser accounts.
 *
 * Kept in D1 and deliberately separate from the admin `users` table in
 * Postgres: an advertiser can never gain an admin role here, no code path lets
 * one write to the other, and the public site never touches the admin store.
 *
 * Passwords and one-time codes are stored as scrypt hashes only.
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

export type AccountStatus = "pending_verification" | "active" | "suspended"

export interface Account {
  id: string
  name: string
  fullName: string
  gender: string
  nationality: string
  email?: string
  phone?: string
  status: AccountStatus
  verifiedAt?: number
  createdAt: number
  lastLoginAt?: number
  /** Live one-time code, only present while one is unspent and unexpired. */
  pendingCode?: string
}

interface AccountRow {
  id: string
  name: string
  full_name: string
  gender: string
  nationality: string
  email: string | null
  phone: string | null
  password_hash: string
  status: string
  verify_hash: string | null
  verify_plain: string | null
  verify_channel: string | null
  verify_expires: number | null
  verify_attempts: number
  verified_at: number | null
  approved_by: string | null
  approved_at: number | null
  created_at: number
  updated_at: number
  last_login_at: number | null
}

const COLUMNS =
  "id,name,full_name,gender,nationality,email,phone,password_hash,status," +
  "verify_hash,verify_plain,verify_channel,verify_expires,verify_attempts,verified_at," +
  "approved_by,approved_at,created_at,updated_at,last_login_at"

function rowToAccount(row: AccountRow): Account {
  return {
    id: row.id,
    name: row.name,
    fullName: row.full_name ?? "",
    gender: row.gender ?? "",
    nationality: row.nationality ?? "",
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    status: row.status as AccountStatus,
    verifiedAt: row.verified_at ?? undefined,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at ?? undefined,
    pendingCode: liveCode(row),
  }
}

/** The clear-text code, but only while it is still valid. */
function liveCode(row: AccountRow): string | undefined {
  if (!row.verify_plain) return undefined
  if (row.verify_expires && row.verify_expires < Date.now()) return undefined
  return row.verify_plain
}

// ---------------------------------------------------------------------------
// In-memory fallback (local dev / builds)
// ---------------------------------------------------------------------------

const memAccounts = new Map<string, AccountRow>()

// ---------------------------------------------------------------------------
// Hashing
// ---------------------------------------------------------------------------

export function hashSecret(
  value: string,
  salt = crypto.randomBytes(16).toString("hex"),
): string {
  return `${salt}:${crypto.scryptSync(value, salt, 64).toString("hex")}`
}

export function verifySecret(value: string, stored: string): boolean {
  const [salt, hash] = String(stored ?? "").split(":")
  if (!salt || !hash) return false
  const computed = crypto.scryptSync(value, salt, 64)
  const expected = Buffer.from(hash, "hex")
  if (computed.length !== expected.length) return false
  return crypto.timingSafeEqual(computed, expected)
}

// ---------------------------------------------------------------------------
// Normalisation
// ---------------------------------------------------------------------------

/** Phone digits only, with a Turkish country code when none was given. */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "")
  if (!digits) return ""
  if (digits.startsWith("90") && digits.length >= 12) return digits
  if (digits.length === 10) return `90${digits}`
  return digits
}

function normalizeIp(ip: string): string {
  return (ip || "unknown").trim().toLowerCase().replace(/^::ffff:/, "")
}

export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase()
}

export function normalizeIdentifier(input: string): string {
  const value = input.trim()
  if (value.includes("@")) return normalizeEmail(value)
  return normalizePhone(value)
}

// ---------------------------------------------------------------------------
// Verification codes
// ---------------------------------------------------------------------------

const CODE_TTL_MS = 15 * 60 * 1000
const MAX_CODE_ATTEMPTS = 5

export function generateCode(): string {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0")
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Look up an account by the email address or phone number it registered with.
 * Returns the full row (including the password hash) — callers must only ever
 * pass the hash to `verifySecret`, never render any part of the row.
 */
export async function lookupAccountByIdentifier(
  identifier: string,
): Promise<AccountRow | null> {
  if (!identifier) return null
  const email = identifier.includes("@")
  const column = email ? "email" : "phone"
  const value = email ? normalizeEmail(identifier) : normalizePhone(identifier)

  const db = getDb()
  if (db) {
    const row = await db
      .prepare(`SELECT ${COLUMNS} FROM user_accounts WHERE ${column} = ?`)
      .bind(value)
      .first<AccountRow>()
    return row ?? null
  }

  for (const row of memAccounts.values()) {
    if (email ? row.email === value : row.phone === value) return row
  }
  return null
}

export async function getAccountById(id: string): Promise<Account | null> {
  const db = getDb()
  if (db) {
    const row = await db
      .prepare(`SELECT ${COLUMNS} FROM user_accounts WHERE id = ?`)
      .bind(id)
      .first<AccountRow>()
    return row ? rowToAccount(row) : null
  }
  const row = memAccounts.get(id)
  return row ? rowToAccount(row) : null
}

export interface CreateAccountInput {
  name: string
  fullName: string
  gender: string
  nationality: string
  email?: string
  phone?: string
  password: string
  /** The clear-text code is returned so the caller can deliver it. */
  code: string
}

export async function createAccount(
  input: CreateAccountInput,
): Promise<{ account: Account; code: string }> {
  const now = Date.now()
  const channel = input.email ? "email" : "phone"
  const row: AccountRow = {
    id: crypto.randomUUID(),
    name: input.name,
    full_name: input.fullName,
    gender: input.gender,
    nationality: input.nationality,
    email: input.email ?? null,
    phone: input.phone ?? null,
    password_hash: hashSecret(input.password),
    status: "pending_verification",
    verify_hash: hashSecret(input.code),
    verify_plain: input.code,
    verify_channel: channel,
    verify_expires: now + CODE_TTL_MS,
    verify_attempts: 0,
    verified_at: null,
    approved_by: null,
    approved_at: null,
    created_at: now,
    updated_at: now,
    last_login_at: null,
  }

  const db = getDb()
  if (db) {
    await db
      .prepare(
        `INSERT INTO user_accounts (${COLUMNS})
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      )
      .bind(
        row.id,
        row.name,
        row.full_name,
        row.gender,
        row.nationality,
        row.email,
        row.phone,
        row.password_hash,
        row.status,
        row.verify_hash,
        row.verify_plain,
        row.verify_channel,
        row.verify_expires,
        row.verify_attempts,
        row.verified_at,
        row.approved_by,
        row.approved_at,
        row.created_at,
        row.updated_at,
        row.last_login_at,
      )
      .run()
  } else {
    memAccounts.set(row.id, row)
  }

  return { account: rowToAccount(row), code: input.code }
}

/**
 * Marks a half-registered account as usable and wipes the code material.
 *
 * Used when a code is confirmed, whichever way it was delivered. The plaintext
 * copy never survives this call.
 */
export async function activateAccount(id: string): Promise<boolean> {
  const now = Date.now()
  const db = getDb()
  if (db) {
    const result = await db
      .prepare(
        `UPDATE user_accounts
         SET status = 'active', verify_hash = NULL, verify_plain = NULL,
             verify_expires = NULL, verify_attempts = 0, verified_at = ?,
             updated_at = ?
         WHERE id = ?`,
      )
      .bind(now, now, id)
      .run()
    return Boolean(result.success)
  }
  const row = memAccounts.get(id)
  if (!row) return false
  memAccounts.set(id, {
    ...row,
    status: "active",
    verify_hash: null,
    verify_plain: null,
    verify_expires: null,
    verify_attempts: 0,
    verified_at: now,
    updated_at: now,
  })
  return true
}

export type VerifyOutcome = "verified" | "wrong_code" | "expired" | "locked"

export async function verifyAccountCode(
  id: string,
  code: string,
): Promise<VerifyOutcome> {
  const db = getDb()
  const row = db
    ? await db
        .prepare(`SELECT ${COLUMNS} FROM user_accounts WHERE id = ?`)
        .bind(id)
        .first<AccountRow>()
    : memAccounts.get(id) ?? null

  if (!row || !row.verify_hash) return "locked"
  if (row.verify_expires && row.verify_expires < Date.now()) {
    // Expired: drop the code so it can never be replayed.
    if (db) {
      await db
        .prepare(
          "UPDATE user_accounts SET verify_hash = NULL, verify_plain = NULL, verify_expires = NULL, updated_at = ? WHERE id = ?",
        )
        .bind(Date.now(), id)
        .run()
    } else {
      row.verify_hash = null
      row.verify_plain = null
      row.verify_expires = null
    }
    return "expired"
  }

  if (!verifySecret(code, row.verify_hash)) {
    const attempts = row.verify_attempts + 1
    const locked = attempts >= MAX_CODE_ATTEMPTS
    if (db) {
      await db
        .prepare(
          locked
            ? "UPDATE user_accounts SET verify_attempts = ?, verify_hash = NULL, verify_plain = NULL, verify_expires = NULL, updated_at = ? WHERE id = ?"
            : "UPDATE user_accounts SET verify_attempts = ?, updated_at = ? WHERE id = ?",
        )
        .bind(attempts, Date.now(), id)
        .run()
    } else {
      row.verify_attempts = attempts
      if (locked) {
        row.verify_hash = null
        row.verify_plain = null
        row.verify_expires = null
      }
    }
    return locked ? "locked" : "wrong_code"
  }

  const now = Date.now()
  const updated: AccountRow = {
    ...row,
    status: "active",
    verify_hash: null,
    verify_plain: null,
    verify_expires: null,
    verify_attempts: 0,
    verified_at: now,
    updated_at: now,
  }

  if (db) {
    await db
      .prepare(
        `UPDATE user_accounts
         SET status = 'active', verify_hash = NULL, verify_plain = NULL,
             verify_expires = NULL, verify_attempts = 0, verified_at = ?,
             updated_at = ?
         WHERE id = ?`,
      )
      .bind(now, now, id)
      .run()
  } else {
    memAccounts.set(id, updated)
  }

  return "verified"
}

export async function recordLogin(id: string): Promise<void> {
  const now = Date.now()
  const db = getDb()
  if (db) {
    await db
      .prepare("UPDATE user_accounts SET last_login_at = ?, updated_at = ? WHERE id = ?")
      .bind(now, now, id)
      .run()
    return
  }
  const row = memAccounts.get(id)
  if (row) memAccounts.set(id, { ...row, last_login_at: now })
}

/**
 * The only profile fields an advertiser may change themselves. The email/phone
 * (the sign-in identity) and the account status are deliberately not writable
 * from the public side.
 */
export async function updateAccountProfile(
  id: string,
  patch: { name: string; fullName: string; gender: string; nationality: string },
): Promise<boolean> {
  const now = Date.now()
  const db = getDb()
  if (db) {
    const result = await db
      .prepare(
        `UPDATE user_accounts
         SET name = ?, full_name = ?, gender = ?, nationality = ?, updated_at = ?
         WHERE id = ?`,
      )
      .bind(patch.name, patch.fullName, patch.gender, patch.nationality, now, id)
      .run()
    return Boolean(result.success)
  }
  const row = memAccounts.get(id)
  if (!row) return false
  memAccounts.set(id, {
    ...row,
    name: patch.name,
    full_name: patch.fullName,
    gender: patch.gender,
    nationality: patch.nationality,
    updated_at: now,
  })
  return true
}

// ---------------------------------------------------------------------------
// Admin-facing listing
// ---------------------------------------------------------------------------

export async function listAccounts(limit = 200): Promise<
  Array<Account & { hasOpenCode: boolean }>
> {
  const db = getDb()
  if (db) {
    const result = await db
      .prepare(
        `SELECT ${COLUMNS} FROM user_accounts ORDER BY created_at DESC LIMIT ?`,
      )
      .bind(limit)
      .all<AccountRow>()
    return (result.results ?? []).map((row) => ({
      ...rowToAccount(row),
      hasOpenCode: Boolean(row.verify_hash),
    }))
  }
  return [...memAccounts.values()]
    .sort((a, b) => b.created_at - a.created_at)
    .slice(0, limit)
    .map((row) => ({
      ...rowToAccount(row),
      hasOpenCode: Boolean(row.verify_hash),
    }))
}

/** Admin toggles account status: active / suspended. */
export async function setAccountStatus(
  id: string,
  status: AccountStatus,
  approvedBy?: string,
): Promise<boolean> {
  const now = Date.now()
  const db = getDb()
  if (db) {
    const result = await db
      .prepare(
        `UPDATE user_accounts
         SET status = ?, approved_by = COALESCE(?, approved_by),
             approved_at = COALESCE(approved_at, ?), updated_at = ?
         WHERE id = ?`,
      )
      .bind(status, approvedBy ?? null, now, now, id)
      .run()
    return Boolean(result.success)
  }
  const row = memAccounts.get(id)
  if (!row) return false
  memAccounts.set(id, { ...row, status, updated_at: now })
  return true
}

/**
 * Erase an account and everything that belongs to it.
 *
 * Ownership of any listing is dropped rather than cascading a delete, so the
 * live ad stays on the site and simply stops being tied to this account.
 */
export async function deleteAccount(id: string): Promise<boolean> {
  const db = getDb()
  if (!db) {
    return memAccounts.delete(id)
  }
  const result = await db.batch([
    db.prepare("DELETE FROM listing_owners WHERE owner_id = ?").bind(id),
    db.prepare("DELETE FROM listing_revisions WHERE owner_id = ?").bind(id),
    db.prepare("DELETE FROM user_reports WHERE target_user_id = ?").bind(id),
    db.prepare("DELETE FROM user_accounts WHERE id = ?").bind(id),
  ])
  return result.every((entry) => entry.success)
}

export async function countAccountsByStatus(): Promise<Record<string, number>> {
  const db = getDb()
  if (db) {
    const result = await db
      .prepare("SELECT status, COUNT(*) AS count FROM user_accounts GROUP BY status")
      .all<{ status: string; count: number }>()
    const out: Record<string, number> = { active: 0, pending_verification: 0, suspended: 0 }
    for (const row of result.results ?? []) out[row.status] = row.count
    return out
  }
  const out: Record<string, number> = { active: 0, pending_verification: 0, suspended: 0 }
  for (const row of memAccounts.values()) out[row.status] += 1
  return out
}

// ---------------------------------------------------------------------------
// Ownership
// ---------------------------------------------------------------------------

export type ListingState = "pending_review" | "published" | "changes_pending"

/** Slug used while a brand new listing is still awaiting moderation. */
export function pendingSlug(submissionId: string): string {
  return `pending:${submissionId}`
}

export function isPendingSlug(slug: string): boolean {
  return slug.startsWith("pending:")
}

export function submissionIdFromSlug(slug: string): string {
  return slug.replace(/^pending:/, "")
}

export async function claimListing(
  slug: string,
  ownerId: string,
  state: ListingState = "pending_review",
): Promise<void> {
  const now = Date.now()
  const db = getDb()
  if (!db) return
  await db
    .prepare(
      `INSERT INTO listing_owners (slug, owner_id, state, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(slug) DO UPDATE SET owner_id = excluded.owner_id,
                                       state = excluded.state,
                                       updated_at = excluded.updated_at`,
    )
    .bind(slug, ownerId, state, now, now)
    .run()
}

/** Called when an admin publishes a submission, so ownership follows the slug. */
export async function moveListingOwner(
  fromSlug: string,
  toSlug: string,
  state: ListingState = "published",
): Promise<void> {
  const now = Date.now()
  const db = getDb()
  if (!db) return
  await db
    .prepare(
      `UPDATE listing_owners SET slug = ?, state = ?, updated_at = ?
       WHERE slug = ?`,
    )
    .bind(toSlug, state, now, fromSlug)
    .run()
}

export async function releaseListing(slug: string): Promise<void> {
  const db = getDb()
  if (!db) return
  await db.batch([
    db.prepare("DELETE FROM listing_owners WHERE slug = ?").bind(slug),
    db.prepare("DELETE FROM listing_revisions WHERE slug = ?").bind(slug),
  ])
}

export async function setListingState(
  slug: string,
  state: ListingState,
): Promise<void> {
  const db = getDb()
  if (db) {
    await db
      .prepare("UPDATE listing_owners SET state = ?, updated_at = ? WHERE slug = ?")
      .bind(state, Date.now(), slug)
      .run()
  }
}

export async function getListingOwner(
  slug: string,
): Promise<{ ownerId: string; state: ListingState } | null> {
  const db = getDb()
  if (db) {
    const row = await db
      .prepare("SELECT owner_id, state FROM listing_owners WHERE slug = ?")
      .bind(slug)
      .first<{ owner_id: string; state: ListingState }>()
    if (!row) return null
    return { ownerId: row.owner_id, state: row.state }
  }
  return null
}

export async function listOwnerListings(
  ownerId: string,
): Promise<Array<{ slug: string; state: ListingState; updatedAt: number }>> {
  const db = getDb()
  if (db) {
    const result = await db
      .prepare(
        `SELECT slug, state, updated_at FROM listing_owners
         WHERE owner_id = ? ORDER BY updated_at DESC`,
      )
      .bind(ownerId)
      .all<{ slug: string; state: ListingState; updated_at: number }>()
    return (result.results ?? []).map((row) => ({
      slug: row.slug,
      state: row.state,
      updatedAt: row.updated_at,
    }))
  }
  return []
}

// ---------------------------------------------------------------------------
// Revisions (owner-requested edits)
// ---------------------------------------------------------------------------

export async function createRevision(input: {
  slug: string
  ownerId: string
  data: unknown
  note?: string
}): Promise<string> {
  const id = crypto.randomUUID()
  const now = Date.now()
  const db = getDb()
  if (db) {
    await db
      .prepare(
        `INSERT INTO listing_revisions (id, slug, owner_id, data, note, status, created_at)
         VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
      )
      .bind(id, input.slug, input.ownerId, JSON.stringify(input.data), input.note ?? null, now)
      .run()
    await setListingState(input.slug, "changes_pending")
  }
  return id
}

export interface Revision {
  id: string
  slug: string
  ownerId: string
  data: unknown
  note?: string
  status: string
  createdAt: number
}

export async function listRevisions(limit = 100): Promise<Revision[]> {
  const db = getDb()
  if (!db) return []
  const result = await db
    .prepare(
      `SELECT id, slug, owner_id, data, note, status, created_at
       FROM listing_revisions WHERE status = 'pending'
       ORDER BY created_at ASC LIMIT ?`,
    )
    .bind(limit)
    .all<{
      id: string
      slug: string
      owner_id: string
      data: string
      note: string | null
      status: string
      created_at: number
    }>()
  return (result.results ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    ownerId: row.owner_id,
    data: JSON.parse(row.data),
    note: row.note ?? undefined,
    status: row.status,
    createdAt: row.created_at,
  }))
}

export async function resolveRevision(
  id: string,
  status: "approved" | "rejected",
): Promise<{ slug: string; ownerId: string; data: unknown } | null> {
  const db = getDb()
  if (!db) return null
  const row = await db
    .prepare("SELECT slug, owner_id, data FROM listing_revisions WHERE id = ?")
    .bind(id)
    .first<{ slug: string; owner_id: string; data: string }>()
  if (!row) return null
  await db
    .prepare("UPDATE listing_revisions SET status = ?, reviewed_at = ? WHERE id = ?")
    .bind(status, Date.now(), id)
    .run()
  return { slug: row.slug, ownerId: row.owner_id, data: JSON.parse(row.data) }
}

export async function countPendingRevisions(): Promise<number> {
  const db = getDb()
  if (!db) return 0
  const row = await db
    .prepare("SELECT COUNT(*) AS count FROM listing_revisions WHERE status = 'pending'")
    .first<{ count: number }>()
  return row?.count ?? 0
}

/** Drop every still-open edit request for a listing once one is handled. */
export async function clearPendingRevisions(slug: string): Promise<void> {
  const db = getDb()
  if (!db) return
  await db
    .prepare("DELETE FROM listing_revisions WHERE slug = ? AND status = 'pending'")
    .bind(slug)
    .run()
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export interface UserReport {
  id: string
  targetUserId: string
  reporterName: string
  reporterEmail: string
  reason: string
  details: string
  status: string
  createdAt: number
  targetName?: string
}

export async function createReport(input: {
  targetUserId: string
  reporterName: string
  reporterEmail: string
  reason: string
  details: string
}): Promise<string> {
  const id = crypto.randomUUID()
  const now = Date.now()
  const db = getDb()
  if (db) {
    await db
      .prepare(
        `INSERT INTO user_reports
           (id, target_user_id, reporter_name, reporter_email, reason, details, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'open', ?)`,
      )
      .bind(
        id,
        input.targetUserId,
        input.reporterName,
        input.reporterEmail,
        input.reason,
        input.details,
        now,
      )
      .run()
  }
  return id
}

export async function listReports(limit = 100): Promise<UserReport[]> {
  const db = getDb()
  if (!db) return []
  const result = await db
    .prepare(
      `SELECT r.id, r.target_user_id, r.reporter_name, r.reporter_email,
              r.reason, r.details, r.status, r.created_at, a.name AS target_name
       FROM user_reports r
       LEFT JOIN user_accounts a ON a.id = r.target_user_id
       WHERE r.status = 'open'
       ORDER BY r.created_at DESC LIMIT ?`,
    )
    .bind(limit)
    .all<{
      id: string
      target_user_id: string
      reporter_name: string
      reporter_email: string
      reason: string
      details: string
      status: string
      created_at: number
      target_name: string | null
    }>()
  return (result.results ?? []).map((row) => ({
    id: row.id,
    targetUserId: row.target_user_id,
    reporterName: row.reporter_name,
    reporterEmail: row.reporter_email,
    reason: row.reason,
    details: row.details,
    status: row.status,
    createdAt: row.created_at,
    targetName: row.target_name ?? undefined,
  }))
}

export async function countOpenReports(): Promise<number> {
  const db = getDb()
  if (!db) return 0
  const row = await db
    .prepare("SELECT COUNT(*) AS count FROM user_reports WHERE status = 'open'")
    .first<{ count: number }>()
  return row?.count ?? 0
}

export async function resolveReport(id: string): Promise<boolean> {
  const db = getDb()
  if (!db) return false
  const result = await db
    .prepare("UPDATE user_reports SET status = 'resolved', resolved_at = ? WHERE id = ?")
    .bind(Date.now(), id)
    .run()
  return Boolean(result.success)
}

// ---------------------------------------------------------------------------
// Rate limiting (sign-up / login throttling)
// ---------------------------------------------------------------------------

const ATTEMPT_WINDOW_MS = 60 * 60 * 1000

export async function recordAuthAttempt(kind: string, ip: string): Promise<void> {
  const key = `${kind}:${normalizeIp(ip)}`
  const now = Date.now()
  const db = getDb()
  if (!db) return
  await db.batch([
    db.prepare("INSERT INTO auth_attempts (ip, at) VALUES (?, ?)").bind(key, now),
    db.prepare("DELETE FROM auth_attempts WHERE at < ?").bind(now - ATTEMPT_WINDOW_MS),
  ])
}

export async function countRecentAuthAttempts(
  kind: string,
  ip: string,
): Promise<number> {
  const key = `${kind}:${normalizeIp(ip)}`
  const since = Date.now() - ATTEMPT_WINDOW_MS
  const db = getDb()
  if (!db) return 0
  const row = await db
    .prepare("SELECT COUNT(*) AS count FROM auth_attempts WHERE ip = ? AND at >= ?")
    .bind(key, since)
    .first<{ count: number }>()
  return row?.count ?? 0
}
