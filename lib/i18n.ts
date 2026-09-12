import type { Dictionary } from "./dictionaries/types"

export const locales = ["ar", "en"] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "ar"

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value)

export const directionOf = (locale: Locale): "rtl" | "ltr" =>
  locale === "ar" ? "rtl" : "ltr"

export const localeName: Record<Locale, string> = {
  ar: "العربية",
  en: "English",
}

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  ar: () => import("./dictionaries/ar").then((module) => module.default),
  en: () => import("./dictionaries/en").then((module) => module.default),
}

export const getDictionary = (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]()