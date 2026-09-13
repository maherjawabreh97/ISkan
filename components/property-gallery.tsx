"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import type { Locale } from "@/lib/i18n"
import { FavoriteButton } from "@/components/favorite-button"

export function PropertyGallery({
  images,
  slug,
  name,
  locale,
}: {
  images: string[]
  slug: string
  name: string
  locale: Locale
}) {
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const isRtl = locale === "ar"

  const prev = useCallback(
    () => setIndex((i) => (i - 1 + images.length) % images.length),
    [images.length],
  )
  const next = useCallback(
    () => setIndex((i) => (i + 1) % images.length),
    [images.length],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
      if (event.key === "ArrowLeft") {
        if (isRtl) next()
        else prev()
      }
      if (event.key === "ArrowRight") {
        if (isRtl) prev()
        else next()
      }
    }
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKey)
    }
  }, [open, isRtl, prev, next])

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft
  const NextIcon = isRtl ? ChevronLeft : ChevronRight

  return (
    <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/70">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative block aspect-[16/10] w-full cursor-zoom-in"
        aria-label="Open fullscreen"
      >
        <Image
          src={images[index]}
          alt={`${name} — ${index + 1}`}
          fill
          priority
          sizes="(min-width: 1024px) 62vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/40 via-transparent to-transparent" />
        <FavoriteButton slug={slug} className="absolute end-4 top-4 z-10" />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                prev()
              }}
              aria-label="Previous image"
              className="absolute start-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink-900 shadow-lg backdrop-blur transition hover:bg-white"
            >
              <PrevIcon className="size-5" />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                next()
              }}
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
      </button>

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

      {open && (
        <div className="fixed inset-0 z-[60] bg-ink-950/95 backdrop-blur-sm" role="dialog" aria-modal="true">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close fullscreen"
            className="absolute end-5 top-5 grid size-11 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-white/20"
          >
            <X className="size-5" />
          </button>

          <div className="relative flex h-full items-center justify-center px-4 py-16 sm:px-16">
            <Image
              src={images[index]}
              alt={`${name} — ${index + 1}`}
              fill
              sizes="100vw"
              className="object-contain p-4"
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous image"
                  className="absolute start-4 grid size-12 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-white/20"
                >
                  <PrevIcon className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next image"
                  className="absolute end-4 grid size-12 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-white/20"
                >
                  <NextIcon className="size-6" />
                </button>
              </>
            )}

            <span className="absolute bottom-6 start-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold text-white ring-1 ring-white/20 backdrop-blur">
              {index + 1} / {images.length}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}