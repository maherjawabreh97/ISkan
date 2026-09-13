"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react"
import type { Locale } from "@/lib/i18n"

type Testimonial = {
  quote: string
  name: string
  role: string
}

export function Testimonials({
  items,
  locale,
  title,
  subtitle,
}: {
  items: Testimonial[]
  locale: Locale
  title: string
  subtitle: string
}) {
  const [index, setIndex] = useState(0)
  const isRtl = locale === "ar"

  const next = useCallback(
    () => setIndex((i) => (i + 1) % items.length),
    [items.length],
  )
  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length)

  useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next])

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft
  const NextIcon = isRtl ? ChevronLeft : ChevronRight
  const item = items[index]

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-brand-700 ring-1 ring-brand-100">
            <Star className="size-3.5 fill-gold-500 text-gold-500" />
            4.9
          </span>
          <h2 className="mt-4 text-2xl font-black text-ink-900 sm:text-3xl">
            {title}
          </h2>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">{subtitle}</p>
        </div>

        <div className="relative mx-auto mt-10 max-w-3xl">
          <div className="relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-soft ring-1 ring-slate-200/70 sm:p-12">
            <span className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-gold-400 to-brand-500" />
            <span className="pointer-events-none absolute -end-16 -top-16 size-44 rounded-full bg-gold-400/10 blur-2xl" />
            <span className="relative grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-800 text-white shadow-lg shadow-brand-800/25">
              <Quote className="size-6 rtl:-scale-x-100" />
            </span>
            <blockquote className="mt-6 text-lg font-semibold leading-9 text-ink-900 sm:text-xl">
              “{item.quote}”
            </blockquote>
            <div className="mt-7 flex items-center gap-4 border-t border-slate-100 pt-6">
              <span className="grid size-12 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-black text-white">
                {item.name.charAt(0)}
              </span>
              <div>
                <p className="font-extrabold text-ink-900">{item.name}</p>
                <p className="text-sm font-semibold text-slate-500">
                  {item.role}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous testimonial"
              className="grid size-10 place-items-center rounded-full bg-white text-ink-900 ring-1 ring-slate-200 transition hover:bg-brand-600 hover:text-white"
            >
              <PrevIcon className="size-5" />
            </button>
            <div className="flex items-center gap-2">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Testimonial ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === index ? "w-8 bg-brand-600" : "w-2 bg-slate-300"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={next}
              aria-label="Next testimonial"
              className="grid size-10 place-items-center rounded-full bg-white text-ink-900 ring-1 ring-slate-200 transition hover:bg-brand-600 hover:text-white"
            >
              <NextIcon className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}