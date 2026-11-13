"use client"

import { useEffect } from "react"
import { trackRecentlyViewed } from "@/lib/use-recently-viewed"

/**
 * Invisible helper mounted on the detail page. Records the visit once the page
 * is in the browser, where localStorage actually exists.
 */
export function TrackPropertyView({ slug }: { slug: string }) {
  useEffect(() => {
    trackRecentlyViewed(slug)
  }, [slug])

  return null
}
