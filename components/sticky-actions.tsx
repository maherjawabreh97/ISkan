"use client"

import { useEffect, useState } from "react"
import { Heart, Phone, MessageCircle } from "lucide-react"
import { toggleFavorite, useFavorites } from "@/lib/use-favorites"
import type { Dictionary } from "@/lib/dictionaries/types"
import type { Locale } from "@/lib/i18n"

const WHATSAPP_BASE = "https://wa.me/905432466309"

export function StickyActions({
  locale,
  dict,
  slug,
  name,
}: {
  locale: Locale
  dict: Dictionary
  slug: string
  name: string
}) {
  const favorites = useFavorites()
  const saved = favorites.includes(slug)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const whatsappHref = `${WHATSAPP_BASE}?text=${encodeURIComponent(
    `Hello Iskan! I'm interested in: ${name}`,
  )}`

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur transition-transform duration-300 md:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <div className="mx-auto flex max-w-lg items-center gap-2.5">
        <button
          type="button"
          onClick={() => toggleFavorite(slug)}
          aria-pressed={saved}
          className={`grid size-12 shrink-0 place-items-center rounded-2xl ring-1 transition ${
            saved
              ? "bg-red-500 text-white ring-transparent"
              : "bg-white text-ink-900 ring-slate-200"
          }`}
        >
          <Heart className={`size-5 ${saved ? "fill-current" : ""}`} />
        </button>

        <a
          href={`tel:+905432466309`}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-ink-900 px-5 py-3.5 text-sm font-extrabold text-white transition active:scale-[0.98]"
        >
          <Phone className="size-4.5" />
          {dict.common.callNow}
        </a>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/20 transition active:scale-[0.98]"
        >
          <MessageCircle className="size-4.5" />
          WhatsApp
        </a>
      </div>
    </div>
  )
}