"use client"

import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { Search, Sparkles } from "lucide-react"
import type { Dictionary } from "@/lib/dictionaries/types"
import type { Locale } from "@/lib/i18n"

export function SearchBox({
  locale,
  dict,
}: {
  locale: Locale
  dict: Dictionary
}) {
  const router = useRouter()
  const [q, setQ] = useState("")
  const [city, setCity] = useState("all")
  const [type, setType] = useState("all")

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (q.trim()) params.set("q", q.trim())
    if (city && city !== "all") params.set("city", city)
    if (type && type !== "all") params.set("type", type)
    const query = params.toString()
    router.push(`/${locale}/properties${query ? `?${query}` : ""}`)
  }

  const fieldCls = "w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/45"
  const selectCls = `${fieldCls} cursor-pointer appearance-none pr-6`
  const selectOptionCls = "bg-ink-900 text-white"
  const fieldWrap = "flex items-center gap-2.5 border-white/12 bg-white/[0.06] px-4 transition focus-within:border-gold-400/60 focus-within:bg-white/10 focus-within:ring-2 focus-within:ring-gold-400/30"

  return (
    <form
      onSubmit={onSubmit}
      className="hero-panel-shadow mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-0 overflow-hidden rounded-3xl border border-white/15 p-2.5 glass-dark sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:gap-0"
    >
      <label className={`${fieldWrap} rounded-2xl py-3`}>
        <Search className="size-4 shrink-0 text-gold-300" />
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder={dict.common.searchPlaceholder}
          className={fieldCls}
        />
      </label>

      <label className={`${fieldWrap} mt-px rounded-2xl py-3 lg:mt-0 lg:ms-px`}>
        <select
          value={city}
          onChange={(event) => setCity(event.target.value)}
          className={selectCls}
          aria-label={dict.common.cityLabel}
        >
          <option value="all" className={selectOptionCls}>
            {dict.common.allCities}
          </option>
          {Object.entries(dict.cities).map(([key, label]) => (
            <option key={key} value={key} className={selectOptionCls}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className={`${fieldWrap} mt-px rounded-2xl py-3 lg:mt-0 lg:ms-px`}>
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          className={selectCls}
          aria-label={dict.common.propertyType}
        >
          <option value="all" className={selectOptionCls}>
            {dict.common.allTypes}
          </option>
          {Object.entries(dict.propertyTypes).map(([key, label]) => (
            <option key={key} value={key} className={selectOptionCls}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        className="btn-gold mt-px inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-extrabold md:mt-1 lg:mt-0 lg:ms-2"
      >
        <Sparkles className="size-4" />
        {dict.hero.searchButton}
      </button>
    </form>
  )
}