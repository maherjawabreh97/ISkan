"use client"

import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/cn"

/**
 * Cards used to show `images[0]` and nothing else, so a listing with eight
 * photos looked identical to one with a single photo until you opened it.
 * This puts the whole set behind a swipe on the card itself.
 *
 * Embla drives it: it is the same engine the big property galleries use
 * elsewhere, weighs almost nothing, and handles RTL, touch and keyboard-free
 * pointer dragging without a bespoke gesture layer.
 */

/** More than this and the extra slides cost more bandwidth than they are worth. */
const MAX_SLIDES = 4

export function PropertyCardGallery({
  images,
  alt,
}: {
  images: string[]
  alt: string
}) {
  // Duplicate URLs in the stored list (the demo listing ships the same two
  // photos twice) would otherwise show the same frame twice in a row.
  const slides = Array.from(new Set(images.filter(Boolean))).slice(0, MAX_SLIDES)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    duration: 24,
    align: "start",
  })
  const [selected, setSelected] = useState(0)

  // Embla moves slides with a CSS transform, but Chrome's lazy loader keys off
  // the element's *layout* position, which never changes. A lazy slide that is
  // swiped into view therefore never starts loading and stays empty. Rendering
  // every slide eagerly avoids that entirely; `fetchPriority` keeps the first
  // photo (the one actually painted) ahead of the rest.
  useEffect(() => {
    if (!emblaApi) return
    const sync = () => setSelected(emblaApi.selectedScrollSnap())
    sync()
    emblaApi.on("select", sync)
    emblaApi.on("reInit", sync)
    return () => {
      emblaApi.off("select", sync)
      emblaApi.off("reInit", sync)
    }
  }, [emblaApi])

  // The card itself is a link, so a horizontal drag that ends over the card
  // would also fire a click and open the listing. Record whether the pointer
  // actually travelled before letting the click through.
  const origin = useRef<{ x: number; y: number } | null>(null)
  const dragged = useRef(false)

  if (slides.length === 0) return null

  // One photo needs no engine at all: skip Embla and its listeners entirely.
  if (slides.length === 1) {
    return (
      <div className="absolute inset-0">
        <Image
          src={slides[0]}
          alt={alt}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-[1.06]"
          loading="eager"
          fetchPriority="high"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/75 via-ink-950/5 to-transparent" />
      </div>
    )
  }

  const onPointerDown = (event: PointerEvent) => {
    origin.current = { x: event.clientX, y: event.clientY }
    dragged.current = false
  }

  const onPointerMove = (event: PointerEvent) => {
    if (!origin.current) return
    if (
      Math.abs(event.clientX - origin.current.x) > 8 ||
      Math.abs(event.clientY - origin.current.y) > 8
    ) {
      dragged.current = true
    }
  }

  const onClickCapture = (event: MouseEvent) => {
    if (!dragged.current) return
    event.preventDefault()
    event.stopPropagation()
    dragged.current = false
  }

  const control = (action: () => void) => (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    action()
  }

  return (
    <div
      className="absolute inset-0"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onClickCapture={onClickCapture}
    >
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex h-full touch-pan-y">
          {slides.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="relative h-full min-w-0 flex-[0_0_100%]"
            >
              <Image
                src={src}
                alt={index === 0 ? alt : ""}
                fill
                sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition duration-700 group-hover:scale-[1.06]"
                loading="eager"
                fetchPriority={index === 0 ? "high" : "low"}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Inside the gallery, after the slides: the dots and arrows have to
          paint above this scrim, which is why it lives here rather than in the
          card. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/75 via-ink-950/5 to-transparent" />

      {slides.length > 1 && (
        <>
          {/* Arrows only on devices with a hover-capable pointer; on touch the
              swipe is the whole interaction and two 28px targets over the
              photo would just get in the way. */}
          <button
            type="button"
            onClick={control(() => emblaApi?.scrollPrev())}
            aria-label="Previous photo"
            className="absolute start-2 top-1/2 hidden size-7 -translate-y-1/2 place-items-center rounded-full bg-ink-950/45 text-white opacity-0 backdrop-blur-sm transition duration-200 hover:bg-ink-950/70 group-hover:opacity-100 focus-visible:opacity-100 sm:grid"
          >
            <ChevronLeft className="size-4 rtl:-scale-x-100" />
          </button>
          <button
            type="button"
            onClick={control(() => emblaApi?.scrollNext())}
            aria-label="Next photo"
            className="absolute end-2 top-1/2 hidden size-7 -translate-y-1/2 place-items-center rounded-full bg-ink-950/45 text-white opacity-0 backdrop-blur-sm transition duration-200 hover:bg-ink-950/70 group-hover:opacity-100 focus-visible:opacity-100 sm:grid"
          >
            <ChevronRight className="size-4 rtl:-scale-x-100" />
          </button>

          {/* Dots sit bottom-end: the price owns the bottom-start corner. */}
          <div className="absolute bottom-2.5 end-2.5 flex items-center gap-1">
            {slides.map((src, index) => (
              <button
                key={`dot-${src}-${index}`}
                type="button"
                onClick={control(() => emblaApi?.scrollTo(index))}
                aria-label={`Photo ${index + 1} of ${slides.length}`}
                aria-current={index === selected}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === selected
                    ? "w-4 bg-gold-400"
                    : "w-1.5 bg-white/60 hover:bg-white",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
