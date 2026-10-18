"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import {
  clearSessionCookie,
  requireActionUser,
  setSessionCookie,
} from "@/lib/auth"
import {
  banIp,
  clearFailures,
  getBan,
  getFailureCount,
  logEvent,
  maxLoginFailures,
  recordFailure,
  unbanIp,
} from "@/lib/security-store"
import {
  deleteListingManager,
  moveManagerToSlug,
  pendingManagerSlug,
} from "@/lib/listing-managers"
import type {
  AmenityKey,
  CityKey,
  PropertyTypeKey,
  PurposeKey,
} from "@/lib/dictionaries/types"
import type { CurrencyKey } from "@/lib/format"
import { hasLocale } from "@/lib/i18n"
import { office, type Property } from "@/lib/properties"
import {
  getStoredProperty,
  removeProperty,
  slugExists,
  upsertProperty,
} from "@/lib/properties-store"
import {
  getSubmission,
  setSubmissionStatus,
} from "@/lib/submissions-store"
import {
  deleteTestimonial,
  getTestimonial,
  setTestimonialStatus,
} from "@/lib/testimonials-store"
import { deleteUploads } from "@/lib/uploads"
import { isStoredVideoUrl } from "@/lib/videos"
import {
  getUserByUsername,
  removeUser,
  saveUser,
  verifyPassword,
  type Role,
} from "@/lib/users-store"

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim()
}

/** Clamp the submitted locale to a known value (prevents open redirects). */
function langOf(formData: FormData): string {
  const value = text(formData, "lang")
  return hasLocale(value) ? value : "ar"
}

function numberValue(formData: FormData, key: string): number {
  const value = Number(formData.get(key))
  return Number.isFinite(value) ? value : 0
}

/** Price may include thousand separators (e.g. "400,000" or "400.000"). */
function priceValue(formData: FormData, key: string): number {
  const digits = String(formData.get(key) ?? "").replace(/[^\d]/g, "")
  const value = Number(digits)
  return Number.isFinite(value) ? value : 0
}

function checked(formData: FormData, key: string): boolean {
  const value = formData.get(key)
  return value === "on" || value === "true" || value === "1"
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}

async function uniqueSlug(base: string): Promise<string> {
  const safeBase = base || "listing"
  let candidate = safeBase
  let index = 1
  while (await slugExists(candidate)) {
    candidate = `${safeBase}-${index}`
    index += 1
  }
  return candidate
}

async function clientIp(): Promise<string> {
  const store = await headers()
  // `cf-connecting-ip` is set (and cannot be spoofed) by Cloudflare.
  return (
    store.get("cf-connecting-ip")?.trim() ||
    store.get("x-real-ip")?.trim() ||
    store.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  )
}

export async function loginAction(formData: FormData): Promise<void> {
  const lang = langOf(formData)
  const username = text(formData, "username")
  const password = String(formData.get("password") ?? "")
  const userAgent = (await headers()).get("user-agent") ?? ""
  const ip = await clientIp()

  // 1) Honeypot: a hidden field real users never fill. A filled value means an
  //    automated client, so ban the IP immediately without revealing why.
  if (text(formData, "website")) {
    await banIp(ip, { reason: "honeypot", username, userAgent })
    await logEvent({
      type: "bot_blocked",
      ip,
      at: Date.now(),
      username,
      userAgent,
      detail: "honeypot",
    })
    redirect(`/${lang}/admin/login?error=blocked`)
  }

  // 2) Already banned?
  if (await getBan(ip)) {
    redirect(`/${lang}/admin/login?error=blocked`)
  }

  // 3) Too many previous failures — ban and stop.
  if ((await getFailureCount(ip)) >= maxLoginFailures()) {
    await banIp(ip, { reason: "too_many_failures", username, userAgent })
    redirect(`/${lang}/admin/login?error=blocked`)
  }

  // 4) Bot protection is honeypot + per-IP rate limit + the ban above, so no
  //    third-party CAPTCHA script has to run on the page (see proxy.ts CSP).

  const user = await getUserByUsername(username)
  if (!user || !verifyPassword(password, user.passwordHash)) {
    const result = await recordFailure(ip, { username, userAgent })
    await logEvent({
      type: "login_failure",
      ip,
      at: Date.now(),
      username,
      userAgent,
      detail: `failures=${result.count}`,
    })
    if (result.banned) {
      await logEvent({
        type: "ip_banned",
        ip,
        at: Date.now(),
        username,
        userAgent,
        detail: "too_many_failures",
      })
    }
    redirect(`/${lang}/admin/login?error=${result.banned ? "blocked" : "1"}`)
  }

  await clearFailures(ip)
  await logEvent({
    type: "login_success",
    ip,
    at: Date.now(),
    username,
    userAgent,
  })
  await setSessionCookie(user.id, user.role)
  redirect(`/${lang}/admin`)
}

export async function unbanIpAction(formData: FormData): Promise<void> {
  const lang = langOf(formData)
  await requireActionUser(lang, ["admin"])

  const ip = text(formData, "ip")
  if (ip) {
    await unbanIp(ip)
    await logEvent({ type: "ip_unbanned", ip, at: Date.now() })
  }

  revalidatePath(`/${lang}/admin/security`)
  redirect(`/${lang}/admin/security`)
}

export async function logoutAction(formData: FormData): Promise<void> {
  const lang = langOf(formData)
  await clearSessionCookie()
  redirect(`/${lang}/admin/login`)
}

export async function savePropertyAction(formData: FormData): Promise<void> {
  const lang = langOf(formData)
  await requireActionUser(lang, ["admin", "editor"])

  const originalSlug = text(formData, "originalSlug")
  const nameEn = text(formData, "nameEn")
  const nameAr = text(formData, "nameAr")
  const existing = originalSlug
    ? await getStoredProperty(originalSlug)
    : undefined

  const slug = originalSlug
    ? originalSlug
    : await uniqueSlug(slugify(nameEn) || "listing")

  const existingImages = formData.getAll("existingImages").map(String)
  const removedImages = new Set(formData.getAll("removeImage").map(String))
  const keptImages = existingImages.filter((url) => !removedImages.has(url))
  // Only delete media that was really part of this property, so a crafted form
  // cannot point `removeImage` at somebody else's upload.
  await deleteUploads(
    (existing?.images ?? []).filter((url) => removedImages.has(url)),
  )

  const newImages = formData.getAll("newImages").map(String).filter(Boolean)
  const images = [...keptImages, ...newImages]

  const existingVideos = formData
    .getAll("existingVideos")
    .map(String)
    .filter(isStoredVideoUrl)
  const removedVideos = new Set(formData.getAll("removeVideo").map(String))
  const keptVideos = existingVideos.filter((url) => !removedVideos.has(url))
  await deleteUploads(
    (existing?.videos ?? []).filter((url) => removedVideos.has(url)),
  )

  const newVideos = formData
    .getAll("newVideos")
    .map(String)
    .filter(isStoredVideoUrl)
  const videos = [...keptVideos, ...newVideos]

  const purpose = (text(formData, "purpose") || "sale") as PurposeKey
  const floorText = text(formData, "floor")
  const netAreaText = text(formData, "netArea")
  const requirementsAr = text(formData, "requirementsAr")
  const requirementsEn = text(formData, "requirementsEn")
  const floorLabelAr = text(formData, "floorLabelAr")
  const floorLabelEn = text(formData, "floorLabelEn")

  const property: Property = {
    slug,
    type: (text(formData, "type") || "apartment") as PropertyTypeKey,
    purpose,
    price: priceValue(formData, "price"),
    currency: (text(formData, "currency") || "TRY") as CurrencyKey,
    pricePerMonth: purpose === "rent" ? checked(formData, "pricePerMonth") : false,
    area: numberValue(formData, "area"),
    netArea: netAreaText ? numberValue(formData, "netArea") : undefined,
    bedrooms: numberValue(formData, "bedrooms"),
    bathrooms: numberValue(formData, "bathrooms"),
    livingRooms: numberValue(formData, "livingRooms"),
    parking: numberValue(formData, "parking"),
    yearBuilt: numberValue(formData, "yearBuilt"),
    floor: floorText ? numberValue(formData, "floor") : undefined,
    floorLabel:
      floorLabelAr || floorLabelEn
        ? { ar: floorLabelAr || floorLabelEn, en: floorLabelEn || floorLabelAr }
        : undefined,
    citizenshipEligible: checked(formData, "citizenshipEligible"),
    advertiser: (() => {
      const nameAr = text(formData, "advertiserNameAr")
      const nameEn = text(formData, "advertiserNameEn")
      const whatsapp = text(formData, "advertiserWhatsapp")
      if (!nameAr && !nameEn && !whatsapp) return undefined
      return {
        name: {
          ar: nameAr || nameEn,
          en: nameEn || nameAr,
        },
        whatsapp: whatsapp.replace(/\D/g, ""),
      }
    })(),
    location: (() => {
      if (!text(formData, "locationEnabled")) return undefined
      const lat = Number(text(formData, "locationLat"))
      const lng = Number(text(formData, "locationLng"))
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined
      if (lat === 0 && lng === 0) return undefined
      const label = text(formData, "locationLabel")
      return {
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
        ...(label ? { label } : {}),
      }
    })(),
    city: (text(formData, "city") || "kayashehir") as CityKey,
    featured: checked(formData, "featured"),
    dateAdded: existing?.dateAdded ?? new Date().toISOString().slice(0, 10),
    name: {
      en: nameEn || nameAr,
      ar: nameAr || nameEn,
    },
    address: {
      en: text(formData, "addressEn"),
      ar: text(formData, "addressAr"),
    },
    description: {
      en: text(formData, "descriptionEn"),
      ar: text(formData, "descriptionAr"),
    },
    requirements:
      requirementsAr || requirementsEn
        ? {
            en: requirementsEn || requirementsAr,
            ar: requirementsAr || requirementsEn,
          }
        : undefined,
    amenities: formData.getAll("amenities").map(String) as AmenityKey[],
    images: images.length ? images : existing?.images ?? [],
    videos: videos.length ? videos : [],
    agent: existing?.agent ?? office,
  }

  await upsertProperty(property)
  revalidatePath("/", "layout")
  redirect(`/${lang}/admin/properties`)
}

export async function deletePropertyAction(formData: FormData): Promise<void> {
  const lang = langOf(formData)
  await requireActionUser(lang, ["admin", "editor"])

  const slug = text(formData, "slug")
  if (slug) {
    const property = await getStoredProperty(slug)
    await removeProperty(slug)
    if (property) {
      await deleteUploads([...property.images, ...(property.videos ?? [])])
    }
  }

  revalidatePath("/", "layout")
  redirect(`/${lang}/admin/properties`)
}

export async function saveUserAction(formData: FormData): Promise<void> {
  const lang = langOf(formData)
  await requireActionUser(lang, ["admin"])

  const id = text(formData, "id")
  const username = text(formData, "username")
  const name = text(formData, "name")
  const role = (text(formData, "role") || "viewer") as Role
  const password = String(formData.get("password") ?? "")

  if (!username) {
    redirect(`/${lang}/admin/users${id ? `/${id}` : "/new"}?error=1`)
  }

  await saveUser({
    id: id || undefined,
    username,
    name,
    role,
    password: password || undefined,
  })

  revalidatePath("/", "layout")
  redirect(`/${lang}/admin/users`)
}

export async function deleteUserAction(formData: FormData): Promise<void> {
  const lang = langOf(formData)
  const actor = await requireActionUser(lang, ["admin"])

  const id = text(formData, "id")
  if (id && id === actor.id) {
    redirect(`/${lang}/admin/users?error=self`)
  }

  if (id) {
    try {
      await removeUser(id)
    } catch (error) {
      if (error instanceof Error && error.message === "LAST_ADMIN") {
        redirect(`/${lang}/admin/users?error=last`)
      }
      throw error
    }
  }

  revalidatePath("/", "layout")
  redirect(`/${lang}/admin/users`)
}

/**
 * Publish a visitor submission: creates a real property from it (in "draft"
 * shape — the admin can refine it afterwards) and marks the request approved.
 */
export async function approveSubmissionAction(formData: FormData): Promise<void> {
  const lang = langOf(formData)
  await requireActionUser(lang, ["admin", "editor"])

  const id = text(formData, "id")
  const submission = id ? await getSubmission(id) : null
  if (!submission) {
    redirect(`/${lang}/admin/submissions?error=notfound`)
  }

  const slug = await uniqueSlug(
    slugify(submission.title) ||
      `${submission.purpose}-${submission.type}-${submission.city}`,
  )

  const property: Property = {
    slug,
    type: submission.type,
    purpose: submission.purpose,
    price: submission.price,
    currency: submission.currency,
    pricePerMonth:
      submission.purpose === "rent" ? submission.pricePerMonth : false,
    area: submission.area,
    bedrooms: submission.bedrooms,
    bathrooms: submission.bathrooms,
    livingRooms: submission.livingRooms ?? 0,
    parking: 0,
    yearBuilt: 0,
    floor: submission.floor,
    citizenshipEligible: false,
    city: submission.city,
    featured: false,
    dateAdded: new Date().toISOString().slice(0, 10),
    name: { en: submission.title, ar: submission.title },
    address: { en: submission.address, ar: submission.address },
    description: { en: submission.description, ar: submission.description },
    amenities: submission.furnished ? ["furnished"] : [],
    images: submission.images,
    videos: submission.videos ?? [],
    agent: office,
  }

  await upsertProperty(property)
  await setSubmissionStatus(submission.id, "approved", slug)
  // Hand the advertiser's own code/password over to the published listing so
  // they can still take it down themselves later on.
  await moveManagerToSlug(pendingManagerSlug(submission.id), slug)
  revalidatePath("/", "layout")
  // Send the admin straight to the editor so they can polish the listing.
  redirect(`/${lang}/admin/properties/${slug}`)
}

/** Reject a submission and clean up the images that were uploaded with it. */
export async function rejectSubmissionAction(formData: FormData): Promise<void> {
  const lang = langOf(formData)
  await requireActionUser(lang, ["admin", "editor"])

  const id = text(formData, "id")
  const submission = id ? await getSubmission(id) : null
  if (submission) {
    await deleteUploads([...submission.images, ...(submission.videos ?? [])])
    await setSubmissionStatus(submission.id, "rejected")
    await deleteListingManager(pendingManagerSlug(submission.id))
  }

  revalidatePath(`/${lang}/admin/submissions`)
  redirect(`/${lang}/admin/submissions`)
}

/** Approve a visitor testimonial so it appears on the public site. */
export async function approveTestimonialAction(
  formData: FormData,
): Promise<void> {
  const lang = langOf(formData)
  await requireActionUser(lang, ["admin", "editor"])

  const id = text(formData, "id")
  const testimonial = id ? await getTestimonial(id) : null
  if (!testimonial) {
    redirect(`/${lang}/admin/testimonials?error=notfound`)
  }

  await setTestimonialStatus(testimonial.id, "approved")
  revalidatePath("/", "layout")
  revalidatePath(`/${lang}/admin/testimonials`)
  redirect(`/${lang}/admin/testimonials`)
}

/** Delete a testimonial (pending or approved). */
export async function deleteTestimonialAction(
  formData: FormData,
): Promise<void> {
  const lang = langOf(formData)
  await requireActionUser(lang, ["admin", "editor"])

  const id = text(formData, "id")
  if (id) {
    await deleteTestimonial(id)
  }

  revalidatePath("/", "layout")
  revalidatePath(`/${lang}/admin/testimonials`)
  redirect(`/${lang}/admin/testimonials`)
}
