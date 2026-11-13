"use client"

import { useEffect, useState } from "react"
import type { DisplayCurrency } from "./currency"

const STORAGE_KEY = "iskan:currency"
const EVENT = "iskan:currency-change"

export function getCurrency(): DisplayCurrency {
  if (typeof window === "undefined") return "TRY"
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === "USD" || raw === "EUR" || raw === "SAR" || raw === "TRY") return raw
  } catch {
    /* ignore */
  }
  return "TRY"
}

export function setCurrency(value: DisplayCurrency) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value)
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT))
}

export function useCurrency(): [DisplayCurrency, (v: DisplayCurrency) => void] {
  const [currency, set] = useState<DisplayCurrency>(() => getCurrency())
  useEffect(() => {
    const handler = () => set(getCurrency())
    window.addEventListener(EVENT, handler)
    window.addEventListener("storage", handler)
    return () => {
      window.removeEventListener(EVENT, handler)
      window.removeEventListener("storage", handler)
    }
  }, [])
  return [currency, setCurrency]
}
