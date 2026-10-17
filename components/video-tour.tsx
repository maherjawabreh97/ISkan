"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import type { Locale } from "@/lib/i18n"

/**
 * Video tour player with the same navigation feel as the photo gallery:
 * previous / next arrows over the player plus a position counter.
 */
export function VideoTour({
  videos,
  poster,
  locale = "ar",
}: {
  videos: string[]
  poster?: string
  locale?: Locale
}) {
  const [active, setActive] = useState(0)
  const isRtl = locale === "ar"
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft
  const NextIcon = isRtl ? ChevronLeft : ChevronRight

  if (videos.length === 0) return null

  const total = videos.length
  const prev = () => setActive((i) => (i - 1 + total) % total)
  const next = () => setActive((i) => (i + 1) % total)

  return (
    <div>
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-ink-950 ring-1 ring-slate-900/5">
        <video
          key={videos[active]}
          src={videos[active]}
          poster={poster}
          controls
          playsInline
          preload="metadata"
          className="h-full w-full object-contain"
        />

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous video"
              className="absolute start-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink-900 shadow-lg backdrop-blur transition hover:bg-white"
            >
              <PrevIcon className="size-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next video"
              className="absolute end-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink-900 shadow-lg backdrop-blur transition hover:bg-white"
            >
              <NextIcon className="size-5" />
            </button>
            <span className="absolute bottom-3 end-3 rounded-full bg-ink-950/70 px-3 py-1 text-xs font-bold text-white backdrop-blur">
              {active + 1} / {total}
            </span>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {videos.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Video ${index + 1}`}
              aria-pressed={index === active}
              className={`group relative w-28 shrink-0 overflow-hidden rounded-xl ring-2 transition ${
                index === active
                  ? "ring-brand-600"
                  : "ring-transparent opacity-65 hover:opacity-100"
              }`}
            >
              <video
                src={`${url}#t=0.5`}
                muted
                playsInline
                preload="metadata"
                className="pointer-events-none aspect-video w-full bg-ink-950 object-cover"
              />
              <span className="absolute inset-0 grid place-items-center bg-ink-950/35 transition group-hover:bg-ink-950/20">
                <Play className="size-4 text-white" />
              </span>
              <span className="absolute bottom-1 start-1.5 rounded bg-ink-950/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {index + 1}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
