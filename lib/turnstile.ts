/**
 * Cloudflare Turnstile (bot protection) — optional.
 *
 * Turnstile is enabled automatically as soon as BOTH `TURNSTILE_SITE_KEY`
 * (public, plain-text var) and `TURNSTILE_SECRET_KEY` (secret) are configured
 * on the Worker. When they are missing the check is skipped so the login keeps
 * working.
 *
 * Create a free widget at https://dash.cloudflare.com/?to=/:account/turnstile
 */

import { headers } from "next/headers"
import { logEvent } from "@/lib/security-store"

export function turnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.TURNSTILE_SITE_KEY)
}

export function turnstileSiteKey(): string {
  return process.env.TURNSTILE_SITE_KEY ?? ""
}

export interface TurnstileResult {
  /** True when the request may proceed. */
  ok: boolean
  /** True when Turnstile is not configured and the check was skipped. */
  skipped: boolean
}

export async function verifyTurnstile(
  formData: FormData,
  ip: string,
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  const siteKey = process.env.TURNSTILE_SITE_KEY
  
  // If secrets are not configured, skip verification but log the event
  if (!secret || !siteKey) {
    const ip = await (await headers()).get("cf-connecting-ip")?.trim() || "unknown"
    await logEvent({
      type: "turnstile_misconfigured",
      ip,
      at: Date.now(),
      detail: "Turnstile keys not fully configured",
    })
    return { ok: true, skipped: true }
  }

  const token = String(formData.get("cf-turnstile-response") ?? "")
  if (!token) return { ok: false, skipped: false }

  try {
    const body = new URLSearchParams({
      secret,
      response: token,
      remoteip: ip,
    })
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body },
    )
    const data = (await response.json()) as { success?: boolean }
    return { ok: Boolean(data.success), skipped: false }
  } catch {
    return { ok: false, skipped: false }
  }
}
