"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import {
  clearSessionCookie,
  requireActionUser,
  setSessionCookie,
} from "@/lib/auth"
import { checkRateLimit, recordFailure, resetRateLimit } from "@/lib/rate-limit"
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
import { deleteUploads } from "@/lib/uploads"
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
  const forwarded = store.get("x-forwarded-for")
  return (
    forwarded?.split(",")[0]?.trim() ||
    store.get("x-real-ip") ||
    store.get("cf-connecting-ip") ||
    "unknown"
  )
}

export async function loginAction(formData: FormData): Promise<void> {
  const lang = langOf(formData)
  const username = text(formData, "username")
  const password = String(formData.get("password") ?? "")

  const ip = await clientIp()
  const userKey = `${ip}:${username.toLowerCase()}`
  const ipKey = `ip:${ip}`
  if (!checkRateLimit(userKey).allowed || !checkRateLimit(ipKey).allowed) {
    redirect(`/${lang}/admin/login?error=rate`)
  }

  const user = await getUserByUsername(username)
  if (!user || !verifyPassword(password, user.passwordHash)) {
    recordFailure(userKey)
    recordFailure(ipKey)
    redirect(`/${lang}/admin/login?error=1`)
  }

  resetRateLimit(userKey)
  await setSessionCookie(user.id, user.role)
  redirect(`/${lang}/admin`)
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
  await deleteUploads([...removedImages])

  const newImages = formData.getAll("newImages").map(String).filter(Boolean)
  const images = [...keptImages, ...newImages]

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
    price: numberValue(formData, "price"),
    currency: (text(formData, "currency") || "TRY") as CurrencyKey,
    pricePerMonth: purpose === "rent" ? checked(formData, "pricePerMonth") : false,
    area: numberValue(formData, "area"),
    netArea: netAreaText ? numberValue(formData, "netArea") : undefined,
    bedrooms: numberValue(formData, "bedrooms"),
    bathrooms: numberValue(formData, "bathrooms"),
    parking: numberValue(formData, "parking"),
    yearBuilt: numberValue(formData, "yearBuilt"),
    floor: floorText ? numberValue(formData, "floor") : undefined,
    floorLabel:
      floorLabelAr || floorLabelEn
        ? { ar: floorLabelAr || floorLabelEn, en: floorLabelEn || floorLabelAr }
        : undefined,
    citizenshipEligible: checked(formData, "citizenshipEligible"),
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
    if (property) await deleteUploads(property.images)
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
