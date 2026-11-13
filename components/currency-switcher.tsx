"use client"

import { useCurrency } from "@/lib/use-currency"
import { DISPLAY_CURRENCIES, CURRENCY_SYMBOL } from "@/lib/currency"
import type { Locale } from "@/lib/i18n"

export function CurrencySwitcher({ locale }: { locale: Locale }) {
  const [currency, setCurrency] = useCurrency()
  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value as any)}
      aria-label={locale === "ar" ? "العملة" : "Currency"}
      className="h-8 cursor-pointer rounded-full bg-white/10 px-2 text-xs font-bold text-white ring-1 ring-white/15 transition hover:bg-white/15"
    >
      {DISPLAY_CURRENCIES.map((c) => (
        <option key={c} value={c} className="bg-ink-900 text-white">
          {CURRENCY_SYMBOL[c]} {c}
        </option>
      ))}
    </select>
  )
}
