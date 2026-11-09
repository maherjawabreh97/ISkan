"use client"

import { useEffect, useRef } from "react"
import { motion, useScroll, useTransform } from "motion/react"

/**
 * Parallax layer for the homepage hero.
 *
 * The image drifts upward at half the scroll speed, which is the single most
 * recognisable "premium" cue on a marketing page and costs nothing beyond a
 * transform. It is disabled under `prefers-reduced-motion` and never runs on
 * the server, so the page still paints a complete hero before hydration.
 */
export function HeroParallax({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <motion.div className="absolute inset-0 h-[130%]" style={{ y }}>
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
      </motion.div>
    </div>
  )
}