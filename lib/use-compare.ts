"use client"

import { useEffect, useState } from "react"
import { COMPARE_MAX, type CompareEntry } from "./compare"

const STORAGE_KEY = "iskan:compare"
const EVENT = "iskan:compare-change"

/**
 * Older builds stored a bare `string[]` of slugs. Accept both shapes so a
 * visitor who had a tray before the upgrade does not lose it.
 */
function normalize(raw: unknown): CompareEntry[] {
  if (!Array.isArray(raw)) return []
  const out: CompareEntry[] = []
  for (const item of raw) {
    if (typeof item === "string") {
      out.push({ slug: item })
    } else if (
      item &&
      typeof item === "object" &&
      typeof (item as CompareEntry).slug === "string"
    ) {
      out.push(item as CompareEntry)
    }
    if (out.length >= COMPARE_MAX) break
  }
  return out
}

export function readCompare(): CompareEntry[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return normalize(raw ? JSON.parse(raw) : [])
  } catch {
    return []
  }
}

export function compareSlugs(): string[] {
  return readCompare().map((entry) => entry.slug)
}

function write(entries: CompareEntry[]) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(entries.slice(0, COMPARE_MAX)),
    )
  } catch {
    /* ignore quota / private-mode failures */
  }
  window.dispatchEvent(new Event(EVENT))
}

/** Adds a listing, or removes it if it is already in the tray. */
export function toggleCompare(input: CompareEntry | string) {
  const entry = typeof input === "string" ? { slug: input } : input
  const current = readCompare()
  const exists = current.some((item) => item.slug === entry.slug)
  if (exists) {
    write(current.filter((item) => item.slug !== entry.slug))
    return
  }
  if (current.length >= COMPARE_MAX) return
  write([...current, entry])
}

/** Adds without toggling — used by the "add" buttons on the compare page. */
export function addCompare(input: CompareEntry | string) {
  const entry = typeof input === "string" ? { slug: input } : input
  const current = readCompare()
  if (current.some((item) => item.slug === entry.slug)) return
  if (current.length >= COMPARE_MAX) return
  write([...current, entry])
}

export function removeCompare(slug: string) {
  write(readCompare().filter((item) => item.slug !== slug))
}

export function clearCompare() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT))
}

/** Replaces the tray, e.g. when a shared `?slugs=` link is opened. */
export function setCompareEntries(entries: CompareEntry[]) {
  write(entries)
}

export function useCompare(): CompareEntry[] {
  const [items, setItems] = useState<CompareEntry[]>(() =>
    typeof window === "undefined" ? [] : readCompare(),
  )
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
