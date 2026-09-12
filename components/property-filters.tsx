"use client"

import { useRouter } from "next/navigation"
import { useState, type ChangeEvent, type FormEvent } from "react"
import { RotateCcw, Search } from "lucide-react"
import type { Dictionary } from "@/lib/dictionaries/types"
import type { Locale } from "@/lib/i18n"

export interface FilterState {
  q: string
  city: string
  type: string
  purpose: string
  minPrice: string
  maxPrice: string
  sort: string
}

const emptyFilter: FilterState = {
  q: "",
  city: "all",
  type: "all",
  purpose: "all",
  minPrice: "",
  maxPrice: "",
  sort: "newest",
}

export function PropertyFilters({
  locale,
  dict,
  initial,
}: {
  locale: Locale
  dict: Dictionary
  initial: FilterState
}) {
  const router = useRouter()
  const [f, setF] = useState<FilterState>({ ...emptyFilter, ...initial })

  const update =
    (key: keyof FilterState) =>
    (
      event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => setF((prev) => ({ ...prev, [key]: event.target.value }))

  const apply = (event: FormEvent) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (f.q.trim()) params.set("q", f.q.trim())
    if (f.city && f.city !== "all") params.set("city", f.city)
    if (f.type && f.type !== "all") params.set("type", f.type)
    if (f.purpose && f.purpose !== "all") params.set("purpose", f.purpose)
    if (f.minPrice) params.set("minPrice", f.minPrice)
    if (f.maxPrice) params.set("maxPrice", f.maxPrice)
    if (f.sort && f.sort !== "newest") params.set("sort", f.sort)
    const query = params.toString()
    router.push(`/${locale}/properties${query ? `?${query}` : ""}`)
  }

  const clear = () => {
    setF(emptyFilter)
    router.push(`/${locale}/properties`)
  }

  const inputCls =
    "w-full rounded-xl border-0 bg-sand-100 px-3.5 py-2.5 text-sm font-semibold text-ink-900 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-brand-600"
  const labelCls = "mb-1.5 block text-xs font-extrabold text-slate-500"

  return (
    <form
      onSubmit={apply}
      className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 sm:p-6"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-8">
        <div className="lg:col-span-2">
          <label className={labelCls} htmlFor="filter-q">
            {dict.common.searchButton}
          </label>
          <input
            id="filter-q"
            value={f.q}
            onChange={update("q")}
            placeholder={dict.common.searchPlaceholder}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="filter-city">
            {dict.common.cityLabel}
          </label>
          <select
            id="filter-city"
            value={f.city}
            onChange={update("city")}
            className={inputCls}
          >
            <option value="all">{dict.common.allCities}</option>
            {Object.entries(dict.cities).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls} htmlFor="filter-type">
            {dict.common.propertyType}
          </label>
          <select
            id="filter-type"
            value={f.type}
            onChange={update("type")}
            className={inputCls}
          >
            <option value="all">{dict.common.allTypes}</option>
            {Object.entries(dict.propertyTypes).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls} htmlFor="filter-purpose">
            {dict.common.purpose}
          </label>
          <select
            id="filter-purpose"
            value={f.purpose}
            onChange={update("purpose")}
            className={inputCls}
          >
            <option value="all">{dict.common.allPurposes}</option>
            <option value="sale">{dict.common.forSale}</option>
            <option value="rent">{dict.common.forRent}</option>
          </select>
        </div>

        <div>
          <label className={labelCls} htmlFor="filter-min">
            {dict.common.minPrice}
          </label>
          <input
            id="filter-min"
            type="number"
            min={0}
            value={f.minPrice}
            onChange={update("minPrice")}
            placeholder="0"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="filter-max">
            {dict.common.maxPrice}
          </label>
          <input
            id="filter-max"
            type="number"
            min={0}
            value={f.maxPrice}
            onChange={update("maxPrice")}
            placeholder="—"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="filter-sort">
            {dict.common.sortBy}
          </label>
          <select
            id="filter-sort"
            value={f.sort}
            onChange={update("sort")}
            className={inputCls}
          >
            <option value="newest">{dict.common.sortNewest}</option>
            <option value="price-asc">{dict.common.sortPriceAsc}</option>
            <option value="price-desc">{dict.common.sortPriceDesc}</option>
          </select>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
        <button
          type="submit"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-700/20 transition hover:bg-brand-500"
        >
          <Search className="size-4" />
          {dict.common.searchButton}
        </button>
        <button
          type="button"
          onClick={clear}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50 sm:flex-none"
        >
          <RotateCcw className="size-4" />
          {dict.common.clearFilters}
        </button>
      </div>
    </form>
  )
}