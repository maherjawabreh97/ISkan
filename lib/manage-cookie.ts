import { cookies } from "next/headers"

/**
 * Short-lived cookie that carries the manage code back to the "listing sent"
 * screen, so the code never has to travel in a URL (and therefore never leaks
 * through referrers or analytics).
 *
 * It is only ever *read* while the page renders — mutating cookies is allowed
 * in Server Actions and Route Handlers, but throws during a page render.
 */

const COOKIE_NAME = "iskan_manage_code"
const MAX_AGE_SECONDS = 2 * 60 * 60

export async function rememberManageCode(code: string): Promise<void> {
  const store = await cookies()
  store.set(COOKIE_NAME, code, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  })
}

export async function readManageCode(): Promise<string | null> {
  const store = await cookies()
  return store.get(COOKIE_NAME)?.value ?? null
}
