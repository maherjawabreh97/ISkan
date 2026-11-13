"use client"

import { useEffect, useState } from "react"

const STORAGE_KEY = "iskan:area-unit"
const EVENT = "iskan:area-unit-change"

export type AreaUnit = "m2" | "ft2"

export function getAreaUnit(): AreaUnit {
  if (typeof window === "undefined") return "m2"
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === "ft2") return "ft2"
  } catch {
    /* ignore */
  }
  return "m2"
}

export function setAreaUnit(value: AreaUnit) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value)
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT))
}

export function useAreaUnit(): [AreaUnit, (v: AreaUnit) => void] {
  const [unit, set] = useState<AreaUnit>("m2")
  useEffect(() => {
    set(getAreaUnit())
    const handler = () => set(getAreaUnit())
    window.addEventListener(EVENT, handler)
    window.addEventListener("storage", handler)
    return () => {
      window.removeEventListener(EVENT, handler)
      window.removeEventListener("storage", handler)
    }
  }, [])
  return [unit, setAreaUnit]
}

export function convertArea(value: number, to: AreaUnit): number {
  return to === "ft2" ? value * 10.7639 : value
}
