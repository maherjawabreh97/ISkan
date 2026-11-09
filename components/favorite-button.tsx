"use client"

import { Heart } from "lucide-react"
import { toast } from "sonner"
import type { Dictionary } from "@/lib/dictionaries/types"
import { toggleFavorite, useFavorites } from "@/lib/use-favorites"

export function FavoriteButton({
  slug,
  className = "",
  compact = false,
  dict,
}: {
  slug: string
  className?: string
  /** List rows are short, so a 40px target would swamp the artwork. */
  compact?: boolean
  /** When supplied, saving/removing is confirmed with a toast. */
  dict?: Dictionary
}) {
  const favorites = useFavorites()
  const active = favorites.includes(slug)

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        const next = !active
        toggleFavorite(slug)
        if (dict) {
          toast(
            next
              ? dict.common.savedToFavorites
              : dict.common.removedFromFavorites,
            {
              duration: 1800,
              icon: <Heart className="size-4" />,
            },
          )
        }
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
