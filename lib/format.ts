export type CurrencyKey = "TRY" | "USD" | "EUR"

const CURRENCY: Record<
  CurrencyKey,
  { prefix: string; suffix: string; locale: string }
> = {
  TRY: { prefix: "₺", suffix: "", locale: "tr-TR" },
  USD: { prefix: "$", suffix: "USD", locale: "en-US" },
  EUR: { prefix: "€", suffix: "", locale: "de-DE" },
}

export const formatPrice = (
  value: number,
  currency: CurrencyKey = "TRY",
): string => {
  const { prefix, suffix, locale } = CURRENCY[currency]
  const amount = value.toLocaleString(locale)
  return suffix ? `${prefix}${amount} ${suffix}` : `${prefix}${amount}`
}
