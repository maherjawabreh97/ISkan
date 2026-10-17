"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { logEvent } from "@/lib/security-store"
import { countRecentSubmissions, createSubmission } from "@/lib/submissions-store"
import { isStoredVideoUrl } from "@/lib/videos"
import type { CityKey, PropertyTypeKey, PurposeKey } from "@/lib/dictionaries/types"
import type { CurrencyKey } from "@/lib/format"
import { hasLocale } from "@/lib/i18n"

const MAX_SUBMISSIONS_PER_HOUR = 5

const PURPOSES: PurposeKey[] = ["sale", "rent"]
const TYPES: PropertyTypeKey[] = [
  "apartment",
  "villa",
  "office",
  "land",
]
const CITIES: CityKey[] = [
  "kadikoy",
  "besiktas",
  "bakirkoy",
  "fatih",
  "beyoglu",
  "sisli",
  "kayashehir",
  "bagcilar",
  "basaksehir",
  "esenyurt",
  "eyupsultan",
  "kucukcekmece",
]
const CURRENCIES: CurrencyKey[] = ["TRY", "USD", "EUR"]

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim()
}

function numberValue(formData: FormData, key: string): number {
  const value = Number(formData.get(key))
  return Number.isFinite(value) && value >= 0 ? value : 0
}

/**
 * Price can be typed with thousand separators (e.g. "400,000" or "400.000").
 * Keep digits only so the stored value stays a clean number.
 */
function priceValue(formData: FormData, key: string): number {
  const digits = String(formData.get(key) ?? "").replace(/[^\d]/g, "")
  const value = Number(digits)
  return Number.isFinite(value) && value >= 0 ? value : 0
}

function oneOf<T extends string>(value: string, allowed: T[], fallback: T): T {
  return (allowed as string[]).includes(value) ? (value as T) : fallback
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
 * Public "list your property" submission: validates, applies bot protection and
 * stores the listing in the moderation queue. It is never published until an
 * admin approves it from the dashboard.
 */
export async function submitListingAction(formData: FormData): Promise<void> {
  const langValue = text(formData, "lang")
  const lang = hasLocale(langValue) ? langValue : "ar"
  const back = `/${lang}/submit`

  // Honeypot: a hidden field real users never fill. Pretend it worked so bots
  // do not learn the field is a trap (no ban — autofill can trip it too).
  if (text(formData, "website")) {
    const ip = await clientIp()
    await logEvent({
      type: "bot_blocked",
      ip,
      at: Date.now(),
      detail: "listing-honeypot",
    })
    redirect(`${back}?sent=1`)
  }

  const ip = await clientIp()
  const userAgent = (await headers()).get("user-agent") ?? ""

  if (
    (await countRecentSubmissions(ip, 60 * 60 * 1000)) >=
    MAX_SUBMISSIONS_PER_HOUR
  ) {
    redirect(`${back}?error=rate`)
  }

  // Cloudflare Turnstile (skipped automatically when not configured).
  // Commented out to disable Turnstile check: the honeypot + rate limit
  // provide sufficient bot protection without requiring client-side widgets.
  // const captcha = await verifyTurnstile(formData, ip)
  // if (!captcha.ok) {
  //   redirect(`${back}?error=captcha`)
  // }
  
  const contactName = text(formData, "contactName")
  const phone = text(formData, "phone")
  const title = text(formData, "title")
  const description = text(formData, "description")
  if (!contactName || !phone || !title || !description) {
    redirect(`${back}?error=required`)
  }

  const purpose = oneOf(text(formData, "purpose"), PURPOSES, "rent")
  const floor = text(formData, "floor")

  await createSubmission(
    {
      contactName,
      phone,
      email: text(formData, "email") || undefined,
      title,
      purpose,
      type: oneOf(text(formData, "type"), TYPES, "apartment"),
      city: oneOf(text(formData, "city"), CITIES, "kayashehir"),
      price: priceValue(formData, "price"),
      currency: oneOf(text(formData, "currency"), CURRENCIES, "TRY"),
      pricePerMonth: purpose === "rent",
      area: numberValue(formData, "area"),
      bedrooms: numberValue(formData, "bedrooms"),
      bathrooms: numberValue(formData, "bathrooms"),
      livingRooms: numberValue(formData, "livingRooms"),
      floor: floor ? numberValue(formData, "floor") : undefined,
      furnished: formData.get("furnished") !== null,
      address: text(formData, "address"),
      description,
      images: formData.getAll("newImages").map(String).filter(Boolean),
      videos: formData
        .getAll("newVideos")
        .map(String)
        .filter(isStoredVideoUrl),
    },
    { ip, userAgent },
  )

  redirect(`${back}?sent=1`)
}
