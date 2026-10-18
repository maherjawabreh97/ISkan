"use client"

import Link from "next/link"
import { Heart } from "lucide-react"
import { useFavorites } from "@/lib/use-favorites"

export function FavoritesChip({
  locale,
  signedIn = false,
}: {
  locale: "ar" | "en"
  /** Visitors who are not signed in are sent to sign in first. */
  signedIn?: boolean
}) {
  const favorites = useFavorites()
  const href = signedIn
    ? `/${locale}/properties?favorites=1`
    : `/${locale}/login?next=${encodeURIComponent(`/${locale}/properties?favorites=1`)}`

  return (
    <Link
      href={href}
      className="relative grid size-10 shrink-0 place-items-center rounded-full border border-white/12 bg-white/[0.05] text-white transition hover:border-gold-400/40 hover:bg-white/10"
      aria-label="Favorites"
      title="Favorites"
    >
      <Heart className="size-4" />
      {favorites.length > 0 && (
        <span className="absolute -end-1 -top-1 grid size-[18px] place-items-center rounded-full bg-gold-500 text-[10px] font-black text-ink-950 ring-2 ring-ink-950">
          {favorites.length}
        </span>
      )}
    </Link>
  )
}