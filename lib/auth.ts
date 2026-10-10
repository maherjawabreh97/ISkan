import crypto from "node:crypto"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getUser, type Role, type User } from "./users-store"

const COOKIE_NAME = "iskan_admin_session"
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7

/**
 * Resolve the session-signing secret.
 *
 * Never fall back to a hard-coded value: a known default lets anyone forge a
 * session cookie. If `ADMIN_SECRET` is unset we generate a random secret for
 * this process (sessions reset on restart) and warn loudly. Always set
 * `ADMIN_SECRET` in production so sessions survive restarts.
 */
function resolveSecret(): string {
  const fromEnv = process.env.ADMIN_SECRET?.trim()
  if (fromEnv && fromEnv.length >= 16) return fromEnv
  if (fromEnv) {
    console.warn(
      "[auth] ADMIN_SECRET is too short (<16 chars). Use a long random value in production.",
    )
    return fromEnv
  }
  console.warn(
    "[auth] ADMIN_SECRET is not set. Using a random secret for this process — " +
      "sessions will reset on restart, and logins will not work across multiple " +
      "instances. Set ADMIN_SECRET in production.",
  )
  return crypto.randomBytes(32).toString("hex")
}

const SECRET = resolveSecret()

interface SessionPayload {
  id: string
  role: Role
  exp: number
}

function sign(value: string): string {
  return crypto.createHmac("sha256", SECRET).update(value).digest("base64url")
}

function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)
  if (bufferA.length !== bufferB.length) return false
  return crypto.timingSafeEqual(bufferA, bufferB)
}

export function createSessionToken(id: string, role: Role): string {
  const payload = Buffer.from(
    JSON.stringify({
      id,
      role,
      exp: Date.now() + MAX_AGE_SECONDS * 1000,
    } satisfies SessionPayload),
  ).toString("base64url")
  return `${payload}.${sign(payload)}`
}

export function verifySessionToken(token: string): SessionPayload | null {
  const [payload, signature] = token.split(".")
  if (!payload || !signature) return null
  if (!safeEqual(signature, sign(payload))) return null
  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as SessionPayload
    if (!data.id || typeof data.exp !== "number" || data.exp < Date.now()) {
      return null
    }
    return data
  } catch {
    return null
  }
}

export async function setSessionCookie(id: string, role: Role): Promise<void> {
  const store = await cookies()
  store.set(COOKIE_NAME, createSessionToken(id, role), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE_SECONDS,
  })
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return null
  const payload = verifySessionToken(token)
  if (!payload) return null
  const user = await getUser(payload.id)
  if (!user || user.role !== payload.role) return null
  return user
}

export const roleRank: Record<Role, number> = {
  admin: 3,
  editor: 2,
  viewer: 1,
}

export function hasRole(user: User | null, allowed: Role[]): boolean {
  return Boolean(user && allowed.includes(user.role))
}

/**
 * For Server Actions: returns the current user or redirects to login.
 */
export async function requireActionUser(
  lang: string,
  allowed: Role[] = ["admin", "editor", "viewer"],
): Promise<User> {
  const user = await getCurrentUser()
  if (!user) redirect(`/${lang}/admin/login`)
  if (!hasRole(user, allowed)) redirect(`/${lang}/admin?error=forbidden`)
  return user
}
