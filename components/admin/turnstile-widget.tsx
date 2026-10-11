"use client"

import Script from "next/script"

/**
 * Cloudflare Turnstile widget.
 *
 * The script auto-renders any element carrying the `cf-turnstile` class and
 * injects a hidden `cf-turnstile-response` field into the surrounding form.
 * Only rendered when a site key is configured (see lib/turnstile.ts).
 */
export function TurnstileWidget({
  siteKey,
  theme = "dark",
}: {
  siteKey: string
  theme?: "light" | "dark" | "auto"
}) {
  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />
      <div
        className="cf-turnstile"
        data-sitekey={siteKey}
        data-theme={theme}
        data-size="flexible"
      />
    </>
  )
}
