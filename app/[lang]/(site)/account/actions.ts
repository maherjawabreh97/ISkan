"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { requireAccount } from "@/lib/account-auth"
import {
  countRecentAuthAttempts,
  createAccount,
  createReport,
  createRevision,
  generateCode,
  getAccountById,
  getListingOwner,
  isPendingSlug,
  lookupAccountByIdentifier,
  normalizeEmail,
  normalizePhone,
  recordAuthAttempt,
  recordLogin,
  releaseListing,
  submissionIdFromSlug,
  updateAccountProfile,
  verifyAccountCode,
  verifySecret,
  activateAccount,
} from "@/lib/accounts"
import {
  clearAccountCookie,
  clearPendingVerification,
  getPendingVerificationId,
  setAccountCookie,
  setPendingVerification,
  setVerificationDelivery,
} from "@/lib/account-session"
import { sendVerificationEmail } from "@/lib/email"
import { getStoredProperty, removeProperty } from "@/lib/properties-store"
import {
  getSubmission,
  setSubmissionStatus,
} from "@/lib/submissions-store"
import { deleteUploads } from "@/lib/uploads"
import { isStoredVideoUrl } from "@/lib/videos"
import { hasLocale } from "@/lib/i18n"

const MAX_REGISTER_PER_HOUR = 5
const MAX_LOGIN_PER_HOUR = 12

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim()
}

function langOf(formData: FormData): string {
  const value = text(formData, "lang")
  return hasLocale(value) ? value : "ar"
}

function numberValue(formData: FormData, key: string): number | undefined {
  const raw = String(formData.get(key) ?? "").trim()
  if (!raw) return undefined
  const value = Number(raw)
  return Number.isFinite(value) && value >= 0 ? value : undefined
}

function priceValue(formData: FormData, key: string): number | undefined {
  const digits = String(formData.get(key) ?? "").replace(/[^\d]/g, "")
  if (!digits) return undefined
  const value = Number(digits)
  return Number.isFinite(value) && value > 0 ? value : undefined
}

async function clientIp(): Promise<string> {
  const store = await headers()
  return (
    store.get("cf-connecting-ip")?.trim() ||
    store.get("x-real-ip")?.trim() ||
    store.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  )
}

/** Honeypot: hidden from humans, irresistible to bots. */
function isBot(formData: FormData): boolean {
  return text(formData, "website").length > 0
}

/**
 * Where to send someone after they sign in.
 *
 * Only same-site absolute paths are honoured — a `//evil.com` or
 * `https://…` value would turn this into an open redirect.
 */
function safeNext(formData: FormData, lang: string, fallback: string): string {
  const value = text(formData, "next")
  if (!value.startsWith(`/${lang}/`) && value !== `/${lang}`) return fallback
  if (value.includes("//") || value.includes("\\")) return fallback
  return value
}

/**
 * Sign-up. The account starts as `pending_verification`; nothing can be posted
 * or edited until the emailed / texted code is confirmed.
 */
export async function registerAction(formData: FormData): Promise<void> {
  const lang = langOf(formData)
  const back = `/${lang}/register`

  if (isBot(formData)) redirect(`${back}?done=1`)

  const ip = await clientIp()
  if ((await countRecentAuthAttempts("register", ip)) >= MAX_REGISTER_PER_HOUR) {
    redirect(`${back}?error=rate`)
  }

  const name = text(formData, "name")
  const fullName = text(formData, "fullName")
  const gender = text(formData, "gender")
  const nationality = text(formData, "nationality")
  const rawIdentifier = text(formData, "identifier")
  const password = String(formData.get("password") ?? "")
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "")

  if (!name || !fullName || !gender || !nationality || !rawIdentifier) {
    redirect(`${back}?error=required`)
  }
  if (password.length < 8) redirect(`${back}?error=weak`)
  if (password !== passwordConfirm) redirect(`${back}?error=mismatch`)

  const isEmail = rawIdentifier.includes("@")
  const email = isEmail ? normalizeEmail(rawIdentifier) : ""
  const phone = isEmail ? "" : normalizePhone(rawIdentifier)
  if (!email && !phone) redirect(`${back}?error=identifier`)
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect(`${back}?error=identifier`)
  }
  if (phone && phone.length < 10) redirect(`${back}?error=identifier`)

  if (await lookupAccountByIdentifier(rawIdentifier)) {
    redirect(`${back}?error=taken`)
  }

  await recordAuthAttempt("register", ip)

  const code = generateCode()
  const { account } = await createAccount({
    name,
    fullName,
    gender,
    nationality,
    email: email || undefined,
    phone: phone || undefined,
    password,
    code,
  })

  // Only the account id goes into the cookie. The code itself never touches a
  // URL, so it cannot leak through history, `Referer` headers or access logs.
  await setPendingVerification(account.id)

  // Resend sends the code. If there is no address on file, the key is missing,
  // or the sending domain is not verified yet, fall back to showing the code
  // rather than stranding the user.
  const delivered = account.email
    ? await sendVerificationEmail({
        to: account.email,
        code,
        locale: lang === "en" ? "en" : "ar",
      })
    : false
  await setVerificationDelivery(delivered ? "email" : "manual")

  redirect(`${back}?verify=1`)
}

export async function verifyCodeAction(formData: FormData): Promise<void> {
  const lang = langOf(formData)
  const back = `/${lang}/register`

  if (isBot(formData)) redirect(back)

  const code = text(formData, "code")
  if (!code) redirect(`${back}?verify=1&error=required`)

  const ip = await clientIp()
  if ((await countRecentAuthAttempts("verify", ip)) >= MAX_LOGIN_PER_HOUR * 2) {
    redirect(`${back}?error=rate`)
  }
  await recordAuthAttempt("verify", ip)

  // The verification screen only asks for the code, so the account is resolved
  // from the signed cookie set at sign-up. Without it there is nothing to check
  // the code against — say so instead of showing a confusing "invalid email".
  const pendingId = await getPendingVerificationId()
  if (!pendingId) redirect(`/${lang}/register?error=restart`)

  const account = await getAccountById(pendingId)
  if (!account) redirect(`/${lang}/register?error=restart`)
  if (account.status === "active") {
    await setAccountCookie(account.id)
    await clearPendingVerification()
    redirect(`/${lang}/account`)
  }

  const activate = async () => {
    await activateAccount(account.id)
    await recordLogin(account.id)
    await setAccountCookie(account.id)
    await clearPendingVerification()
    redirect(`/${lang}/account`)
  }

  // The code is checked against the hash we stored. The emailed copy and the
  // on-screen copy are the same six digits, so one check covers both paths.
  const outcome = await verifyAccountCode(account.id, code)
  if (outcome === "verified") {
    await activate()
  }
  if (outcome === "expired") redirect(`${back}?verify=1&error=expired`)
  if (outcome === "locked") redirect(`${back}?verify=1&error=locked`)
  redirect(`${back}?verify=1&error=wrongCode`)
}

export async function loginAction(formData: FormData): Promise<void> {
  const lang = langOf(formData)
  const back = `/${lang}/login`

  if (isBot(formData)) redirect(`${back}?done=1`)

  const ip = await clientIp()
  if ((await countRecentAuthAttempts("login", ip)) >= MAX_LOGIN_PER_HOUR) {
    redirect(`${back}?error=rate`)
  }

  const identifier = text(formData, "identifier")
  const password = String(formData.get("password") ?? "")
  if (!identifier || !password) redirect(`${back}?error=required`)

  await recordAuthAttempt("login", ip)

  const account = await lookupAccountByIdentifier(identifier)
  // Same message for "no such account" and "wrong password" so the form
  // cannot be used to discover which identifiers are registered.
  if (!account || !verifySecret(password, account.password_hash)) {
    redirect(`${back}?error=invalid`)
  }
  if (account.status === "pending_verification") {
    redirect(`${back}?error=unverified`)
  }
  if (account.status === "suspended") {
    redirect(`${back}?error=suspended`)
  }

  await recordLogin(account.id)
  await setAccountCookie(account.id)
  redirect(safeNext(formData, lang, `/${lang}/account`))
}

export async function logoutAction(formData: FormData): Promise<void> {
  const lang = langOf(formData)
  await clearAccountCookie()
  redirect(`/${lang}`)
}

/** Public abuse report about an advertiser. */
export async function reportUserAction(formData: FormData): Promise<void> {
  const lang = langOf(formData)
  const back = `/${lang}/report`

  if (isBot(formData)) redirect(`${back}?done=1`)

  const targetUserId = text(formData, "targetUserId")
  const reason = text(formData, "reason")
  const details = text(formData, "details")
  if (!targetUserId || !reason) redirect(`${back}?error=required`)

  const ip = await clientIp()
  if ((await countRecentAuthAttempts("report", ip)) >= 10) {
    redirect(`${back}?error=rate`)
  }
  await recordAuthAttempt("report", ip)

  await createReport({
    targetUserId,
    reporterName: text(formData, "reporterName"),
    reporterEmail: text(formData, "reporterEmail"),
    reason,
    details,
  })

  redirect(`${back}?done=1`)
}

// ---------------------------------------------------------------------------
// Advertiser self-service
// ---------------------------------------------------------------------------

/**
 * Ask for a change to a live listing. The live copy keeps running until an
 * admin approves, so the ad never goes dark while it is being reviewed.
 */
export async function requestEditAction(formData: FormData): Promise<void> {
  const lang = langOf(formData)
  const account = await requireAccount(lang)
  const back = `/${lang}/account`

  if (isBot(formData)) redirect(`${back}?edit=1`)

  const slug = text(formData, "slug")
  const owner = slug ? await getListingOwner(slug) : null
  if (!owner || owner.ownerId !== account.id || isPendingSlug(slug)) {
    redirect(`${back}?error=notOwned`)
  }

  // Only these fields can be changed by the owner; everything else on the
  // listing (city, type, currency, admin-only flags) stays under our control.
  const patch: Record<string, unknown> = {}
  const title = text(formData, "title")
  const description = text(formData, "description")
  const address = text(formData, "address")
  if (title) patch.title = title
  if (description) patch.description = description
  if (address) patch.address = address
  const price = priceValue(formData, "price")
  if (price) patch.price = price
  for (const key of [
    "area",
    "bedrooms",
    "bathrooms",
    "livingRooms",
    "floor",
  ] as const) {
    const value = numberValue(formData, key)
    if (value !== undefined) patch[key] = value
  }
  const furnished = text(formData, "furnished")
  if (furnished) patch.furnished = furnished === "yes"

  const existingImages = formData.getAll("existingImages").map(String).filter(Boolean)
  const removedImages = new Set(formData.getAll("removeImage").map(String))
  const newImages = formData.getAll("newImages").map(String).filter(Boolean)
  const images = [...existingImages.filter((url) => !removedImages.has(url)), ...newImages]
  if (images.length) patch.images = images

  const existingVideos = formData
    .getAll("existingVideos")
    .map(String)
    .filter(isStoredVideoUrl)
  const removedVideos = new Set(formData.getAll("removeVideo").map(String))
  const newVideos = formData.getAll("newVideos").map(String).filter(isStoredVideoUrl)
  const videos = [...existingVideos.filter((url) => !removedVideos.has(url)), ...newVideos]
  if (videos.length) patch.videos = videos

  if (Object.keys(patch).length === 0) redirect(`${back}?error=noChange`)

  await createRevision({
    slug,
    ownerId: account.id,
    data: patch,
    note: text(formData, "note") || undefined,
  })

  redirect(`${back}?edit=${encodeURIComponent(slug)}`)
}

/** Withdraw one of the advertiser's own listings. */
export async function removeOwnListingAction(formData: FormData): Promise<void> {
  const lang = langOf(formData)
  const account = await requireAccount(lang)
  const back = `/${lang}/account`

  const slug = text(formData, "slug")
  const owner = slug ? await getListingOwner(slug) : null
  if (!owner || owner.ownerId !== account.id) {
    redirect(`${back}?error=notOwned`)
  }

  if (isPendingSlug(slug)) {
    // Never published: drop it from the moderation queue and delete its media.
    const submissionId = submissionIdFromSlug(slug)
    const submission = await getSubmission(submissionId)
    if (submission) {
      await deleteUploads([...submission.images, ...(submission.videos ?? [])])
      await setSubmissionStatus(submissionId, "rejected")
    }
  } else {
    const property = await getStoredProperty(slug)
    await removeProperty(slug)
    if (property) {
      await deleteUploads([...property.images, ...(property.videos ?? [])])
    }
  }

  await releaseListing(slug)
  redirect(`${back}?removed=1`)
}

/** Update the non-sensitive profile details the advertiser can change. */
export async function updateProfileAction(formData: FormData): Promise<void> {
  const lang = langOf(formData)
  const account = await requireAccount(lang)
  const back = `/${lang}/account`

  if (isBot(formData)) redirect(back)

  const name = text(formData, "name")
  const fullName = text(formData, "fullName")
  const gender = text(formData, "gender")
  const nationality = text(formData, "nationality")
  if (!name || !fullName) redirect(`${back}?error=required`)

  await updateAccountProfile(account.id, {
    name,
    fullName,
    gender,
    nationality,
  })

  redirect(`${back}?saved=1`)
}
