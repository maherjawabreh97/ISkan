"use client"

import { useEffect, useState } from "react"

const STORAGE_KEY = "iskan:favorites"
export const FAVORITES_EVENT = "iskan:favorites-change"

export function readFavorites(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function toggleFavorite(slug: string) {
  const favorites = readFavorites()
  const next = favorites.includes(slug)
    ? favorites.filter((item) => item !== slug)
    : [...favorites, slug]
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* storage unavailable */
  }
  window.dispatchEvent(new Event(FAVORITES_EVENT))
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() =>
    typeof window === "undefined" ? [] : readFavorites(),
  )

  useEffect(() => {
    const handler = () => setFavorites(readFavorites())
    window.addEventListener(FAVORITES_EVENT, handler)
    return () => window.removeEventListener(FAVORITES_EVENT, handler)
  }, [])

  return favorites
}