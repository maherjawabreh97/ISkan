"use client"

import Link from "next/link"
import { Heart } from "lucide-react"
import { useFavorites } from "@/lib/use-favorites"

export function FavoritesChip({ locale }: { locale: "ar" | "en" }) {
  const favorites = useFavorites()

  return (
    <Link
      href={`/${locale}/properties?favorites=1`}
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