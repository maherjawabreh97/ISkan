import { redirect } from "next/navigation"
import { getAccountById, type Account } from "@/lib/accounts"
import { getAccountSessionId } from "@/lib/account-session"

/**
 * The signed-in advertiser, or null. Never returns an admin session.
 *
 * An account that has not confirmed its code yet is treated as signed out: it
 * cannot reach the dashboard until the one-time code is entered.
 */
export async function getSignedInAccount(): Promise<Account | null> {
  const id = await getAccountSessionId()
  if (!id) return null
  const account = await getAccountById(id)
  if (!account || account.status !== "active") return null
  return account
}

/** For pages that require a signed-in advertiser. */
export async function requireAccount(lang: string): Promise<Account> {
  const account = await getSignedInAccount()
  if (!account) redirect(`/${lang}/login`)
  return account
}
