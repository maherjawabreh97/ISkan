"use client"

import { useCurrency } from "@/lib/use-currency"
import { formatDisplayPrice } from "@/lib/currency"

export function PriceDisplay({
  value,
  currency,
  perMonth,
  className,
}: {
  value: number
  currency?: string
  perMonth?: boolean
  className?: string
}) {
  const [displayCurrency] = useCurrency()
  return (
    <span className={className}>
      {formatDisplayPrice(value, currency, displayCurrency)}
      {perMonth ? " " : ""}
    </span>
  )
}
