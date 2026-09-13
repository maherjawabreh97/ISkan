"use client"

import { useEffect, useRef, useState } from "react"

export function Counter({
  to,
  prefix = "",
  suffix = "",
  duration = 1.4,
}: {
  to: number
  prefix?: string
  suffix?: string
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)
  const [value, setValue] = useState(0)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return
        started.current = true
        const startTime = performance.now()
        const tick = (now: number) => {
          const progress = Math.min((now - startTime) / (duration * 1000), 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setValue(Math.round(to * eased))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [to, duration])

  return (
    <span ref={ref}>
      {prefix}
      {value.toLocaleString("en-US")}
      {suffix}
    </span>
  )
}