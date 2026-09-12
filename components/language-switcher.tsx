"use client"

import { usePathname, useRouter } from "next/navigation"
import { Languages } from "lucide-react"
import { localeName, type Locale } from "@/lib/i18n"

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname()
  const router = useRouter()
  const target: Locale = locale === "ar" ? "en" : "ar"

  const toggle = () => {
    const rest = pathname.replace(/^\/(ar|en)(?=\/|$)/, "")
    const query = typeof window !== "undefined" ? window.location.search : ""
    router.push(`/${target}${rest}${query}`)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-2 text-sm font-bold text-white transition hover:border-white/40 hover:bg-white/10"
      aria-label={`Switch language to ${localeName[target]}`}
    >
      <Languages className="size-4 opacity-80" />
      <span>{localeName[target]}</span>
    </button>
  )
}