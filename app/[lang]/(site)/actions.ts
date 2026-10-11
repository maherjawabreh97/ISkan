"use server"

import { headers } from "next/headers"
import { logEvent } from "@/lib/security-store"
import {
  countRecentTestimonials,
  createTestimonial,
} from "@/lib/testimonials-store"
import { verifyTurnstile } from "@/lib/turnstile"

const MAX_TESTIMONIALS_PER_HOUR = 5

export type TestimonialErrorCode = "required" | "captcha" | "rate"

export type TestimonialFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; code: TestimonialErrorCode }

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim()
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
 * Public testimonial submission: validates, applies bot protection
 * (honeypot + Turnstile + per-IP rate limit) and stores the review
 * in the moderation queue. It is never published until an admin
 * approves it from the dashboard.
 */
export async function submitTestimonialAction(
  _prev: TestimonialFormState,
  formData: FormData,
): Promise<TestimonialFormState> {
  // Honeypot: a hidden field real users never fill. Pretend it worked
  // so bots do not learn the field is a trap.
  if (text(formData, "website")) {
    const ip = await clientIp()
    await logEvent({
      type: "bot_blocked",
      ip,
      at: Date.now(),
      detail: "testimonial-honeypot",
    })
    return { status: "success" }
  }

  const ip = await clientIp()

  if (
    (await countRecentTestimonials(ip, 60 * 60 * 1000)) >=
    MAX_TESTIMONIALS_PER_HOUR
  ) {
    return { status: "error", code: "rate" }
  }

  // Cloudflare Turnstile (skipped automatically when not configured).
  const captcha = await verifyTurnstile(formData, ip)
  if (!captcha.ok) {
    return { status: "error", code: "captcha" }
  }

  const name = text(formData, "name")
  const review = text(formData, "text")
  if (!name || !review) {
    return { status: "error", code: "required" }
  }

  await createTestimonial(
    { name, role: text(formData, "role"), text: review },
    { ip },
  )

  return { status: "success" }
}
