"use client"

import Link from "next/link"
import { useCompare, clearCompare } from "@/lib/use-compare"
import { getProperties } from "@/lib/properties-store"
import type { Locale } from "@/lib/i18n"
import { X } from "lucide-react"

export function CompareBar({ locale }: { locale: Locale }) {
  const items = useCompare()
  if (items.length === 0) return null
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:bottom-4 md:inset-x-auto md:start-1/2 md:-translate-x-1/2 md:rounded-2xl md:shadow-luxe">
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <span className="text-xs font-bold text-slate-500">
          {locale === "ar" ? "مقارنة" : "Compare"} ({items.length})
        </span>
        <div className="flex flex-1 gap-2 overflow-x-auto">
          {items.map((slug) => (
            <span
              key={slug}
              className="shrink-0 rounded-full bg-sand-100 px-3 py-1 text-xs font-bold text-ink-800"
            >
              {slug}
            </span>
          ))}
        </div>
        <Link
          href={`/${locale}/compare?slugs=${items.join(",")}`}
          className="shrink-0 rounded-full bg-brand-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-700"
        >
          {locale === "ar" ? "قارن" : "Compare"}
        </Link>
        <button
          type="button"
          onClick={clearCompare}
          aria-label="Clear"
          className="grid size-8 shrink-0 place-items-center rounded-full bg-sand-100 text-slate-500 transition hover:bg-slate-200"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
