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
      className="grid size-10 shrink-0 place-items-center rounded-full border border-white/12 bg-white/[0.05] text-white transition hover:border-gold-400/40 hover:bg-white/10"
      aria-label={`Switch language to ${localeName[target]}`}
      title={localeName[target]}
    >
      <Languages className="size-4" />
    </button>
  )
}