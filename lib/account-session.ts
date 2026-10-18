import crypto from "node:crypto"
import { cookies } from "next/headers"

/**
 * Session cookie for public advertiser accounts.
 *
 * A different cookie name and a different signing secret from the admin
 * session, so the two can never be confused or accepted for each other.
 */

const COOKIE_NAME = "iskan_account_session"
const PENDING_VERIFY_COOKIE = "iskan_verify_pending"
const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7 // 7 days
const VERIFY_MAX_AGE = 30 * 60 // 30 minutes — as long as a code can live

function sessionSecret(): string {
  // Derived from ADMIN_SECRET when available so we never ship a second
  // secret to configure, but kept in a distinct namespace.
  const base = process.env.ACCOUNT_SECRET ?? process.env.ADMIN_SECRET ?? "dev-only"
  return crypto.createHash("sha256").update(`account:${base}`).digest("hex")
}

function sign(value: string): string {
  return crypto
    .createHmac("sha256", sessionSecret())
    .update(value)
    .digest("base64url")
}

interface Payload {
  id: string
  exp: number
}

export function createAccountToken(id: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      id,
      exp: Date.now() + DEFAULT_MAX_AGE * 1000,
    } satisfies Payload),
  ).toString("base64url")
  return `${payload}.${sign(payload)}`
}

export function verifyAccountToken(token: string): Payload | null {
  const [payload, signature] = String(token ?? "").split(".")
  if (!payload || !signature) return null
  const a = Buffer.from(signature)
  const b = Buffer.from(sign(payload))
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as Payload
    if (!data.id || typeof data.exp !== "number" || data.exp < Date.now()) return null
    return data
  } catch {
    return null
  }
}

export async function setAccountCookie(id: string): Promise<void> {
  const store = await cookies()
  store.set(COOKIE_NAME, createAccountToken(id), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: DEFAULT_MAX_AGE,
  })
}

export async function clearAccountCookie(): Promise<void> {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

/** Returns the signed-in advertiser id, or null. */
export async function getAccountSessionId(): Promise<string | null> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyAccountToken(token)?.id ?? null
}

/**
 * Which half-registered account this browser is currently verifying.
 *
 * Holds only the account id — never the code — so the code itself never ends up
 * in a URL, the browser history, a `Referer` header or an access log.
 */
export async function setPendingVerification(id: string): Promise<void> {
  const store = await cookies()
  const payload = Buffer.from(id, "utf8").toString("base64url")
  store.set(PENDING_VERIFY_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: VERIFY_MAX_AGE,
  })
}

export async function getPendingVerificationId(): Promise<string | null> {
  const store = await cookies()
  const value = store.get(PENDING_VERIFY_COOKIE)?.value
  if (!value) return null
  const [payload, signature] = value.split(".")
  if (!payload || !signature) return null
  const a = Buffer.from(signature)
  const b = Buffer.from(sign(payload))
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  try {
    return Buffer.from(payload, "base64url").toString("utf8") || null
  } catch {
    return null
  }
}

export async function clearPendingVerification(): Promise<void> {
  const store = await cookies()
  store.delete(PENDING_VERIFY_COOKIE)
}
