"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "motion/react"
import { Heart, RefreshCcw, Search, SearchX, X } from "lucide-react"
import type { Dictionary } from "@/lib/dictionaries/types"
import type { Locale } from "@/lib/i18n"
import type { Property } from "@/lib/properties"
import { PropertyCard } from "@/components/property-card"
import { useFavorites } from "@/lib/use-favorites"

type Tab = "all" | "sale" | "rent" | "favorites"

export function ListingsView({
  locale,
  dict,
  allProperties,
}: {
  locale: Locale
  dict: Dictionary
  allProperties: Property[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const favorites = useFavorites()

  const initialTab = (): Tab => {
    const purpose = searchParams.get("purpose")
    if (purpose === "sale" || purpose === "rent") return purpose
    if (searchParams.get("favorites") === "1") return "favorites"
    return "all"
  }

  const [q, setQ] = useState(() => searchParams.get("q") ?? "")
  const [city, setCity] = useState(() => searchParams.get("city") ?? "all")
  const [type, setType] = useState(() => searchParams.get("type") ?? "all")
  const [sort, setSort] = useState(() => searchParams.get("sort") ?? "newest")
  const [minPrice, setMinPrice] = useState(
    () => searchParams.get("minPrice") ?? "",
  )
  const [maxPrice, setMaxPrice] = useState(
    () => searchParams.get("maxPrice") ?? "",
  )
  const [tab, setTab] = useState<Tab>(initialTab)

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams()
      if (q.trim()) params.set("q", q.trim())
      if (city && city !== "all") params.set("city", city)
      if (type && type !== "all") params.set("type", type)
      if (sort !== "newest") params.set("sort", sort)
      if (minPrice) params.set("minPrice", minPrice)
      if (maxPrice) params.set("maxPrice", maxPrice)
      if (tab === "favorites") params.set("favorites", "1")
      if (tab === "sale" || tab === "rent") params.set("purpose", tab)
      const query = params.toString()
      router.replace(`/${locale}/properties${query ? `?${query}` : ""}`, {
        scroll: false,
      })
    }, 350)
    return () => clearTimeout(timer)
  }, [q, city, type, sort, minPrice, maxPrice, tab, router, locale])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    let list =
      tab === "favorites"
        ? allProperties.filter((property) => favorites.includes(property.slug))
        : tab === "sale" || tab === "rent"
          ? allProperties.filter((property) => property.purpose === tab)
          : allProperties

    if (city !== "all") list = list.filter((p) => p.city === city)
    if (type !== "all") list = list.filter((p) => p.type === type)
    if (minPrice) {
      const min = Number(minPrice)
      if (Number.isFinite(min) && min > 0) list = list.filter((p) => p.price >= min)
    }
    if (maxPrice) {
      const max = Number(maxPrice)
      if (Number.isFinite(max) && max > 0) list = list.filter((p) => p.price <= max)
    }
    if (query) {
      list = list.filter((p) =>
        [
          p.name[locale],
          p.address[locale],
          dict.cities[p.city],
          dict.propertyTypes[p.type],
        ]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
    }

    const sorted = [...list]
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price)
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price)
    else
      sorted.sort(
        (a, b) =>
          new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
      )
    return sorted
  }, [allProperties, favorites, q, city, type, sort, minPrice, maxPrice, tab, locale, dict])

  const counts = useMemo(() => {
    const byPurpose = (purpose: string) =>
      allProperties.filter((p) => p.purpose === purpose).length
    const favoritesCount = allProperties.filter((p) =>
      favorites.includes(p.slug),
    ).length
    return {
      all: allProperties.length,
      sale: byPurpose("sale"),
      rent: byPurpose("rent"),
      favorites: favoritesCount,
    }
  }, [allProperties, favorites])

  const hasActive =
    Boolean(q) || city !== "all" || type !== "all" || tab !== "all" ||
    Boolean(minPrice) || Boolean(maxPrice)

  const clearAll = () => {
    setQ("")
    setCity("all")
    setType("all")
    setSort("newest")
    setMinPrice("")
    setMaxPrice("")
    setTab("all")
    router.replace(`/${locale}/properties`, { scroll: false })
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "all", label: dict.common.all, count: counts.all },
    { key: "sale", label: dict.common.forSale, count: counts.sale },
    { key: "rent", label: dict.common.forRent, count: counts.rent },
    { key: "favorites", label: dict.common.favorites, count: counts.favorites },
  ]

  const inputCls =
    "w-full rounded-xl border-0 bg-sand-100 px-3.5 py-2.5 text-sm font-semibold text-ink-900 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-brand-600"
  const labelCls = "mb-1.5 block text-xs font-extrabold text-slate-500"

  return (
    <>
      <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
        <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
          {tabs.map((item) => {
            const active = tab === item.key
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-extrabold transition ${
                  active
                    ? "text-white"
                    : "bg-sand-50 text-slate-600 ring-1 ring-slate-200 hover:bg-sand-100"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId={`tab-${locale}`}
                    className="absolute inset-0 rounded-full bg-brand-600"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  {item.key === "favorites" && (
                    <Heart className={`size-3.5 ${active ? "fill-current" : ""}`} />
                  )}
                  {item.label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                      active ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {item.count}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-8">
          <div className="lg:col-span-2">
            <label className={labelCls} htmlFor="lv-q">
              {dict.common.searchButton}
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                id="lv-q"
                value={q}
                onChange={(event) => setQ(event.target.value)}
                placeholder={dict.common.searchPlaceholder}
                className={`${inputCls} ps-9`}
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="absolute end-2.5 top-1/2 -translate-y-1/2 rounded-full bg-slate-200 p-0.5 text-slate-500 transition hover:bg-slate-300"
                  aria-label="Clear search"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className={labelCls} htmlFor="lv-city">
              {dict.common.cityLabel}
            </label>
            <select
              id="lv-city"
              value={city}
              onChange={(event) => setCity(event.target.value)}
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
            <label className={labelCls} htmlFor="lv-type">
              {dict.common.propertyType}
            </label>
            <select
              id="lv-type"
              value={type}
              onChange={(event) => setType(event.target.value)}
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
            <label className={labelCls} htmlFor="lv-min">
              {dict.common.minPrice}
            </label>
            <input
              id="lv-min"
              type="number"
              min={0}
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder="0"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls} htmlFor="lv-max">
              {dict.common.maxPrice}
            </label>
            <input
              id="lv-max"
              type="number"
              min={0}
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="—"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls} htmlFor="lv-sort">
              {dict.common.sortBy}
            </label>
            <select
              id="lv-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className={inputCls}
            >
              <option value="newest">{dict.common.sortNewest}</option>
              <option value="price-asc">{dict.common.sortPriceAsc}</option>
              <option value="price-desc">{dict.common.sortPriceDesc}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <p className="text-sm font-bold text-slate-500">
          {filtered.length} {dict.common.results}
        </p>
        {hasActive && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 text-sm font-extrabold text-brand-700 transition hover:text-brand-600"
          >
            <RefreshCcw className="size-3.5" />
            {dict.common.clearFilters}
          </button>
        )}
      </div>

      {filtered.length > 0 ? (
        <motion.div
          className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial={false}
          transition={{ type: "spring", stiffness: 200, damping: 28 }}
        >
          {filtered.map((property, index) => (
            <motion.div
              key={property.slug}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.04 }}
            >
              <PropertyCard
                property={property}
                locale={locale}
                dict={dict}
                className="h-full"
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="mt-6 flex flex-col items-center rounded-3xl bg-white px-6 py-16 text-center ring-1 ring-slate-200/70">
          <span className="grid size-16 place-items-center rounded-full bg-sand-100 text-brand-600">
            <SearchX className="size-8" />
          </span>
          <h2 className="mt-5 text-xl font-extrabold text-ink-900">
            {dict.common.noResults}
          </h2>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            {dict.common.noResultsDesc}
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-700/20 transition hover:bg-brand-500"
          >
            {dict.common.clearFilters}
          </button>
        </div>
      )}
    </>
  )
}