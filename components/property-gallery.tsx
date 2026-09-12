"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Locale } from "@/lib/i18n"

export function PropertyGallery({
  images,
  name,
  locale,
}: {
  images: string[]
  name: string
  locale: Locale
}) {
  const [index, setIndex] = useState(0)
  const isRtl = locale === "ar"

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length)
  const next = () => setIndex((i) => (i + 1) % images.length)

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft
  const NextIcon = isRtl ? ChevronLeft : ChevronRight

  return (
    <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/70">
      <div className="relative aspect-[16/10]">
        <Image
          src={images[index]}
          alt={`${name} — ${index + 1}`}
          fill
          priority
          sizes="(min-width: 1024px) 62vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/40 via-transparent to-transparent" />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="absolute start-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink-900 shadow-lg backdrop-blur transition hover:bg-white"
            >
              <PrevIcon className="size-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute end-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink-900 shadow-lg backdrop-blur transition hover:bg-white"
            >
              <NextIcon className="size-5" />
            </button>
            <span className="absolute bottom-4 end-4 rounded-full bg-ink-950/70 px-3 py-1 text-xs font-bold text-white backdrop-blur">
              {index + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto p-4">
        {images.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setIndex(i)}
            className={`shrink-0 overflow-hidden rounded-xl ring-2 transition ${
              i === index
                ? "ring-brand-600"
                : "ring-transparent opacity-60 hover:opacity-100"
            }`}
            aria-label={`Image ${i + 1}`}
          >
            <Image
              src={src}
              alt=""
              width={96}
              height={64}
              className="h-16 w-24 object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}