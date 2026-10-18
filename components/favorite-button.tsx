"use client"

import { Heart } from "lucide-react"
import { toggleFavorite, useFavorites } from "@/lib/use-favorites"

export function FavoriteButton({
  slug,
  className = "",
  compact = false,
}: {
  slug: string
  className?: string
  /** List rows are short, so a 40px target would swamp the artwork. */
  compact?: boolean
}) {
  const favorites = useFavorites()
  const active = favorites.includes(slug)

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        toggleFavorite(slug)
      }}
      aria-pressed={active}
      aria-label="Save to favorites"
      className={`grid place-items-center rounded-full backdrop-blur transition active:scale-90 ${
        compact ? "size-8" : "size-10"
      } ${className} ${
        active
          ? "bg-red-500 text-white shadow-lg shadow-red-900/30"
          : "bg-white/85 text-ink-900 hover:bg-white"
      }`}
    >
      <Heart
        className={`${compact ? "size-3.5" : "size-4.5"} ${
          active ? "fill-current" : ""
        }`}
      />
    </button>
  )
}