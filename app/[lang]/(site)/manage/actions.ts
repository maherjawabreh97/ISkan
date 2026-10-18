"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { logEvent } from "@/lib/security-store"
import {
  countRecentManageAttempts,
  deleteListingManager,
  isPendingSlug,
  recordManageAttempt,
  submissionIdFromSlug,
  verifyListingManager,
} from "@/lib/listing-managers"
import { deleteUploads } from "@/lib/uploads"
import {
  deleteSubmission,
  getSubmission,
} from "@/lib/submissions-store"
import { getStoredProperty, removeProperty } from "@/lib/properties-store"
import { hasLocale } from "@/lib/i18n"

/** Generous enough for typos, tight enough to stop a brute-force run. */
const MAX_MANAGE_ATTEMPTS_PER_HOUR = 20

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim()
}

function langOf(formData: FormData): string {
  const value = text(formData, "lang")
  return hasLocale(value) ? value : "ar"
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

/**
 * The advertiser signs in with the manage code we handed them at submission
 * time plus the password they chose. If it matches, the listing is taken down:
 * a published property is removed from the site, a submission still awaiting
 * moderation is dropped from the queue.
 */
export async function manageListingAction(formData: FormData): Promise<void> {
  const lang = langOf(formData)
  const back = `/${lang}/manage`
  const code = text(formData, "code")
  const password = String(formData.get("password") ?? "")

  const ip = await clientIp()

  if ((await countRecentManageAttempts(ip)) >= MAX_MANAGE_ATTEMPTS_PER_HOUR) {
    redirect(`${back}?error=rate`)
  }

  if (!code || !password) {
    redirect(`${back}?error=missing`)
  }

  await recordManageAttempt(ip)
  const manager = await verifyListingManager(code, password)

  if (!manager) {
    await logEvent({
      type: "manage_failed",
      ip,
      at: Date.now(),
      detail: `code=${code.slice(0, 4)}***`,
    })
    redirect(`${back}?error=invalid`)
  }

  if (isPendingSlug(manager.slug)) {
    const submissionId = submissionIdFromSlug(manager.slug)
    const submission = await getSubmission(submissionId)
    if (submission) {
      await deleteUploads([...submission.images, ...(submission.videos ?? [])])
    }
    await deleteSubmission(submissionId)
    await deleteListingManager(manager.slug)
    await logEvent({
      type: "listing_removed",
      ip,
      at: Date.now(),
      detail: "pending",
    })
    redirect(`${back}?removed=pending`)
  }

  const slug = manager.slug
  const property = await getStoredProperty(slug)
  if (property) {
    await deleteUploads([...property.images, ...(property.videos ?? [])])
  }
  await removeProperty(slug)
  await deleteListingManager(slug)

  await logEvent({
    type: "listing_removed",
    ip,
    at: Date.now(),
    detail: slug,
  })

  revalidatePath("/", "layout")
  redirect(`${back}?removed=live`)
}
