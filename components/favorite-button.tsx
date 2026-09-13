"use client"

import { Heart } from "lucide-react"
import { toggleFavorite, useFavorites } from "@/lib/use-favorites"

export function FavoriteButton({
  slug,
  className = "",
}: {
  slug: string
  className?: string
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
      className={`grid size-10 place-items-center rounded-full backdrop-blur transition active:scale-90 ${className} ${
        active
          ? "bg-red-500 text-white shadow-lg shadow-red-900/30"
          : "bg-white/85 text-ink-900 hover:bg-white"
      }`}
    >
      <Heart className={`size-4.5 ${active ? "fill-current" : ""}`} />
    </button>
  )
}