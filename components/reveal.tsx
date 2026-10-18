"use client"

import { motion } from "motion/react"
import type { ReactNode } from "react"

export function Reveal({
  children,
  delay = 0,
  y = 26,
  className = "",
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  return (
    // Only the offset is animated. Starting from `opacity: 0` makes the server
    // send the content invisible, so anything that stops the hydration step —
    // a failed chunk, a blocked script, a slow connection — leaves a blank page
    // rather than a slightly less fancy one. A translate offset degrades to
    // "already in place" instead.
    <motion.div
      initial={{ y }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 0.61, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}