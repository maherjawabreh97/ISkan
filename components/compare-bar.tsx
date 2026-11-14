"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Trash2 } from "lucide-react"
import { COMPARE_MAX } from "@/lib/compare"
import { clearCompare, removeCompare, useCompare } from "@/lib/use-compare"
import type { Locale } from "@/lib/i18n"

/**
 * Floating tray that follows the visitor around the site.
 *
 * Rendered as a vertical panel pinned to the left edge so the visitor can
 * always see, add (via property cards), remove and compare selections.
 * Hidden on the comparison page itself, where the table already offers the
 * same controls.
 */
export function CompareBar({ locale }: { locale: Locale }) {
  const items = useCompare()
  const pathname = usePathname()

  if (items.length === 0) return null
  if (pathname === `/${locale}/compare`) return null

  const t = (ar: string, en: string) => (locale === "ar" ? ar : en)

  return (
    <div
      data-compare-bar="1"
      className="fixed left-3 top-1/2 z-40 -translate-y-1/2"
    >
      <div className="flex w-14 flex-col items-center gap-1 rounded-2xl border border-slate-200/80 bg-white/95 p-1.5 shadow-luxe backdrop-blur-xl">
        <div className="flex flex-col items-center gap-1">
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-brand-600 text-[10px] font-bold text-white">
            {items.length}/{COMPARE_MAX}
          </span>
          <button
            type="button"
            onClick={clearCompare}
            aria-label={t("مسح الكل", "Clear all")}
            className="grid size-7 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>

        <div className="flex flex-col gap-1">
          {items.map((entry) => (
            <button
              key={entry.slug}
              type="button"
              onClick={() => removeCompare(entry.slug)}
              title={t("إزالة من المقارنة", "Remove from comparison")}
              className="relative block size-8 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-200 transition hover:ring-2 hover:ring-rose-400"
            >
              {entry.image && (
                <Image
                  src={entry.image}
                  alt={entry.name?.[locale] ?? entry.slug}
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              )}
            </button>
          ))}
        </div>

        <Link
          href={`/${locale}/compare`}
          className="inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-1 py-1.5 text-[10px] font-bold text-white transition hover:bg-brand-700"
        >
          {t("قارن", "Compare")}
        </Link>
      </div>
    </div>
  )
}
