"use client"

import { useEffect, useState } from "react"

/** localStorage key shared by the tracker and the section. */
const STORAGE_KEY = "iskan:recently-viewed"

/** How many slugs we keep. Enough to fill a row, small enough to stay cheap. */
const MAX_ITEMS = 8

/**
 * Reads the recently-viewed slugs after hydration.
 *
 * Starting with an empty array (instead of reading localStorage during render)
 * keeps the server and client markup identical, so React never reports a
 * hydration mismatch. The list simply appears once the effect runs.
 */
export function useRecentlyViewed(): string[] {
  const [slugs, setSlugs] = useState<string[]>([])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed: unknown = JSON.parse(raw)
      if (!Array.isArray(parsed)) return
      setSlugs(parsed.filter((item): item is string => typeof item === "string"))
    } catch {
      // Corrupt or unavailable storage just means an empty list.
    }
  }, [])

  return slugs
}

/**
 * Records a property view. Safe to call on every render of the detail page —
 * it de-duplicates and keeps the newest first.
 */
export function trackRecentlyViewed(slug: string): void {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    const list = Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : []
    const next = [slug, ...list.filter((item) => item !== slug)].slice(
      0,
      MAX_ITEMS,
    )
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Private browsing can refuse writes; the visit is simply not recorded.
  }
}
