"use client"

import { useAreaUnit } from "@/lib/use-area-unit"
import type { Locale } from "@/lib/i18n"

export function AreaUnitSwitcher({ locale }: { locale: Locale }) {
  const [unit, setUnit] = useAreaUnit()
  return (
    <button
      type="button"
      onClick={() => setUnit(unit === "m2" ? "ft2" : "m2")}
      aria-label={locale === "ar" ? "وحدة المساحة" : "Area unit"}
      className="h-8 cursor-pointer rounded-full bg-white/10 px-2 text-xs font-bold text-white ring-1 ring-white/15 transition hover:bg-white/15"
    >
      {unit === "m2" ? "m²" : "ft²"}
    </button>
  )
}
