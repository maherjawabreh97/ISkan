"use client"

import { useEffect, useState } from "react"

const STORAGE_KEY = "iskan:compare"
const EVENT = "iskan:compare-change"
const MAX = 4

export function readCompare(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as string[]) : []
    return Array.isArray(parsed) ? parsed.slice(0, MAX) : []
  } catch {
    return []
  }
}

export function toggleCompare(slug: string) {
  const current = readCompare()
  const next = current.includes(slug)
    ? current.filter((s) => s !== slug)
    : current.length >= MAX
      ? current
      : [...current, slug]
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT))
}

export function clearCompare() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT))
}

export function useCompare() {
  const [items, setItems] = useState<string[]>([])
  useEffect(() => {
    setItems(readCompare())
    const handler = () => setItems(readCompare())
    window.addEventListener(EVENT, handler)
    window.addEventListener("storage", handler)
    return () => {
      window.removeEventListener(EVENT, handler)
      window.removeEventListener("storage", handler)
    }
  }, [])
  return items
}
