"use client"

import { useState } from "react"
import { Check, Copy, Share2 } from "lucide-react"
import type { Locale } from "@/lib/i18n"

/**
 * Share control for a listing.
 *
 * Prefers the native share sheet on phones, falls back to copying the URL.
 * Nothing is sent anywhere — the link is built from `window.location` so it
 * always matches the page the visitor is actually on.
 */
export function PropertyShare({
  locale,
  title,
  className = "",
}: {
  locale: Locale
  title: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard can be blocked; open the link so the visitor can copy it.
      window.prompt(locale === "ar" ? "انسخ الرابط:" : "Copy this link:", url)
    }
  }

  const share = async () => {
    const url = window.location.href
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // The visitor dismissed the sheet — fall through to copying.
      }
    }
    await copy()
  }

  return (
    <button
      type="button"
      onClick={share}
      className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-ink-800 transition hover:border-brand-300 hover:text-brand-700 ${className}`}
    >
      {copied ? (
        <>
          <Check className="size-4 text-emerald-600" />
          {locale === "ar" ? "تم النسخ" : "Copied"}
        </>
      ) : (
        <>
          <Share2 className="size-4" />
          {locale === "ar" ? "مشاركة" : "Share"}
        </>
      )}
    </button>
  )
}

/** Small icon-only copy-link button used next to the title. */
export function CopyLinkButton({ locale }: { locale: Locale }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      aria-label={locale === "ar" ? "نسخ الرابط" : "Copy link"}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.href)
          setCopied(true)
          window.setTimeout(() => setCopied(false), 2000)
        } catch {
          // Ignore; the main share button offers a fallback.
        }
      }}
      className="grid size-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-brand-300 hover:text-brand-700"
    >
      {copied ? (
        <Check className="size-4 text-emerald-600" />
      ) : (
        <Copy className="size-4" />
      )}
    </button>
  )
}
