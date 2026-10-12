"use client"

import { useState } from "react"
import { Play } from "lucide-react"

/**
 * A small video tour player: one main clip plus thumbnail switchers when the
 * listing has more than one video.
 */
export function VideoTour({
  videos,
  poster,
}: {
  videos: string[]
  poster?: string
}) {
  const [active, setActive] = useState(0)

  if (videos.length === 0) return null

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
      </div>

      {videos.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {videos.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Video ${index + 1}`}
              aria-pressed={index === active}
              className={`group relative w-28 overflow-hidden rounded-xl ring-2 transition ${
                index === active
                  ? "ring-brand-600"
                  : "ring-transparent hover:ring-slate-300"
              }`}
            >
              <video
                src={url}
                muted
                playsInline
                preload="metadata"
                className="pointer-events-none aspect-video w-full bg-ink-950 object-cover"
              />
              <span className="absolute inset-0 grid place-items-center bg-ink-950/30">
                <Play className="size-4 text-white" />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
