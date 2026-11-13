export type DisplayCurrency = "TRY" | "USD" | "EUR" | "SAR"

/** Approximate rates: 1 unit of `from` → `to`. Base TRY. */
const RATES: Record<DisplayCurrency, number> = {
  TRY: 1,
  USD: 0.031,
  EUR: 0.0285,
  SAR: 0.116,
}

export const DISPLAY_CURRENCIES: DisplayCurrency[] = ["TRY", "USD", "EUR", "SAR"]

export const CURRENCY_SYMBOL: Record<DisplayCurrency, string> = {
  TRY: "₺",
  USD: "$",
  EUR: "€",
  SAR: "﷼",
}

export function convertPrice(
  value: number,
  from: string,
  to: DisplayCurrency,
): number {
  const fromRate = RATES[(from as DisplayCurrency) ?? "TRY"] ?? 1
  const toRate = RATES[to] ?? 1
  // value in TRY = value / fromRate; then convert to target
  const inTry = value / fromRate
  return inTry * toRate
}

export function formatDisplayPrice(
  value: number,
  fromCurrency: string | undefined,
  toCurrency: DisplayCurrency,
): string {
  const converted = convertPrice(value, fromCurrency ?? "TRY", toCurrency)
  const symbol = CURRENCY_SYMBOL[toCurrency]
  if (toCurrency === "TRY") {
    return `${symbol}${Math.round(converted).toLocaleString("tr-TR")}`
  }
  if (converted >= 1000) {
    return `${symbol}${Math.round(converted).toLocaleString("en-US")}`
  }
  return `${symbol}${converted.toFixed(2)}`
}
