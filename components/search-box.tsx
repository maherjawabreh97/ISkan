"use client"

import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { Search } from "lucide-react"
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

  const fieldCls =
    "h-full w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/50"
  const pillCls =
    "flex items-center gap-2 rounded-2xl bg-white/10 px-4 ring-1 ring-white/15"
  const selectCls = `${fieldCls} cursor-pointer appearance-none`
  const selectOptionCls = "bg-ink-900 text-white"

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-2.5 rounded-3xl border border-white/15 bg-white/10 p-3 shadow-2xl shadow-ink-950/30 backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]"
    >
      <label className={pillCls}>
        <Search className="size-4 shrink-0 text-gold-300" />
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder={dict.common.searchPlaceholder}
          className={fieldCls}
        />
      </label>

      <label className={pillCls}>
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

      <label className={pillCls}>
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
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gold-500 px-6 py-3 text-sm font-extrabold text-ink-950 shadow-lg shadow-gold-600/20 transition hover:bg-gold-400"
      >
        {dict.hero.searchButton}
        <Search className="size-4" />
      </button>
    </form>
  )
}