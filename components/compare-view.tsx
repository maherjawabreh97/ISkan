"use client"

import {
  Fragment,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  ArrowUpRight,
  Banknote,
  Bath,
  BedDouble,
  CalendarDays,
  Car,
  Check,
  Columns3,
  Crown,
  Hammer,
  Home,
  Layers,
  MapPin,
  Plus,
  Ruler,
  Scale,
  Share2,
  ShieldCheck,
  Sofa,
  Sparkles,
  Star,
  Trash2,
  Waves,
  X,
} from "lucide-react"
import { cn } from "@/lib/cn"
import type { AmenityKey, Dictionary } from "@/lib/dictionaries/types"
import type { Locale } from "@/lib/i18n"
import type { Property } from "@/lib/properties"
import { defaultRentAdvertiser } from "@/lib/properties"
import { COMPARE_MAX, toCompareEntry, type CompareEntry } from "@/lib/compare"
import {
  addCompare,
  clearCompare,
  readCompare,
  removeCompare,
  setCompareEntries,
  useCompare,
} from "@/lib/use-compare"
import { useCurrency } from "@/lib/use-currency"
import { convertPrice, formatDisplayPrice } from "@/lib/currency"
import { FavoriteButton } from "@/components/favorite-button"
import { WhatsAppIcon } from "@/components/whatsapp-icon"

type RowDef = {
  id: string
  label: string
  icon: typeof BedDouble
  value: (property: Property) => string | number | boolean | null
  display?: (property: Property, raw: string | number | boolean | null) => ReactNode
  numeric?: (property: Property) => number | null
  best?: "min" | "max" | "true"
}

type SectionDef = {
  id: string
  title: string
  icon: typeof BedDouble
  rows: RowDef[]
}

type Translate = (ar: string, en: string) => string

/** Mount detector that does not need a setState-in-effect. */
const emptySubscribe = () => () => {}

function CompareCell({
  row,
  property,
  winner,
  t,
}: {
  row: RowDef
  property: Property
  winner: boolean
  t: Translate
}) {
  const raw = row.value(property)

  if (typeof raw === "boolean") {
    return raw ? (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold",
          winner ? "bg-emerald-100 text-emerald-700" : "bg-emerald-50 text-emerald-700",
        )}
      >
        <Check className="size-3.5" />
        {t("متوفر", "Yes")}
      </span>
    ) : (
      <span className="text-slate-300">—</span>
    )
  }

  if (raw === null || raw === undefined || raw === "") {
    return <span className="text-slate-300">—</span>
  }

  const content = row.display ? row.display(property, raw) : <span>{String(raw)}</span>
  if (!content) return <span className="text-slate-300">—</span>

  return (
    <span className={cn(winner && "inline-flex items-start gap-1.5 font-bold text-emerald-700")}>
      {winner && (
        <Star className="mt-0.5 size-3 shrink-0 fill-emerald-500 text-emerald-500" />
      )}
      {content}
    </span>
  )
}

export function CompareView({
  locale,
  dict,
  properties,
  initialSlugs,
}: {
  locale: Locale
  dict: Dictionary
  properties: Property[]
  initialSlugs: string[]
}) {
  const t: Translate = (ar, en) => (locale === "ar" ? ar : en)
  const pathname = usePathname()
  const [displayCurrency] = useCurrency()
  const stored = useCompare()

  const seedRef = useRef(false)
  const [differencesOnly, setDifferencesOnly] = useState(false)
  const [copied, setCopied] = useState(false)

  // `false` on the server and during hydration, `true` once mounted.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )

  // A shared `?slugs=` link should replace whatever is in the tray.
  useEffect(() => {
    if (seedRef.current) return
    seedRef.current = true
    if (initialSlugs.length > 0) {
      const entries = initialSlugs.slice(0, COMPARE_MAX).map((slug) => {
        const property = properties.find((item) => item.slug === slug)
        return property ? toCompareEntry(property) : ({ slug } as CompareEntry)
      })
      setCompareEntries(entries)
    }
  }, [initialSlugs, properties])

  const source: CompareEntry[] =
    stored.length > 0
      ? stored
      : !mounted && initialSlugs.length > 0
        ? initialSlugs.slice(0, COMPARE_MAX).map((slug) => {
            const property = properties.find((item) => item.slug === slug)
            return property ? toCompareEntry(property) : ({ slug } as CompareEntry)
          })
        : []

  const items = source
    .map((entry) => properties.find((property) => property.slug === entry.slug))
    .filter((property): property is Property => Boolean(property))
    .slice(0, COMPARE_MAX)

  const itemsKey = items.map((property) => property.slug).join(",")

  // Keep the URL in sync so the page is always shareable and a refresh does not
  // resurrect listings the visitor removed.
  useEffect(() => {
    if (!mounted || !seedRef.current) return
    const url = itemsKey ? `${pathname}?slugs=${itemsKey}` : pathname
    window.history.replaceState(null, "", url)
  }, [mounted, itemsKey, pathname])

  // Backfill metadata for trays saved by older builds (bare slugs).
  useEffect(() => {
    if (!mounted || !seedRef.current || !itemsKey) return
    const current = readCompare()
    const live = itemsKey
      .split(",")
      .map((slug) => properties.find((property) => property.slug === slug))
      .filter((property): property is Property => Boolean(property))
    const stale =
      current.length !== live.length ||
      live.some((property, index) => {
        const entry = current[index]
        return (
          !entry ||
          entry.slug !== property.slug ||
          !entry.name ||
          entry.price !== property.price ||
          entry.image !== property.images[0]
        )
      })
    if (stale) setCompareEntries(live.map(toCompareEntry))
  }, [mounted, itemsKey, properties])

  const money = (value: number, from?: string) =>
    formatDisplayPrice(value, from ?? "TRY", displayCurrency)
  const priceValue = (property: Property) =>
    convertPrice(property.price, property.currency ?? "TRY", displayCurrency)
  const ppmValue = (property: Property) =>
    property.area > 0
      ? convertPrice(property.price / property.area, property.currency ?? "TRY", displayCurrency)
      : null

  const samePurpose =
    items.length > 0 && items.every((property) => property.purpose === items[0].purpose)
  const isRent = samePurpose && items[0]?.purpose === "rent"

  const emptySlots = Math.min(Math.max(COMPARE_MAX - items.length, 0), 2)

  const suggestions = [...properties]
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .filter((property) => !items.some((item) => item.slug === property.slug))
    .slice(0, Math.max(COMPARE_MAX - items.length, 0))

  // ------------------------------ rows ------------------------------
  const priceRows: RowDef[] = [
    {
      id: "price",
      label: isRent ? t("الإيجار الشهري", "Monthly rent") : t("السعر", "Price"),
      icon: Banknote,
      value: (property) => priceValue(property),
      numeric: (property) => priceValue(property),
      best: samePurpose ? "min" : undefined,
      display: (property) => (
        <span className="inline-flex flex-wrap items-baseline gap-1 font-heading text-[15px] font-bold text-ink-900">
          {money(property.price, property.currency)}
          {property.pricePerMonth && (
            <span className="text-[11px] font-medium text-slate-400">
              / {t("شهر", "mo")}
            </span>
          )}
        </span>
      ),
    },
  ]

  if (items.some((property) => property.area > 0)) {
    priceRows.push({
      id: "ppm",
      label: t("سعر المتر المربع", "Price per m²"),
      icon: Ruler,
      value: (property) => ppmValue(property),
      numeric: (property) => ppmValue(property),
      best: samePurpose ? "min" : undefined,
      display: (property) =>
        property.area > 0 ? (
          <span className="font-heading text-sm font-bold text-ink-900">
            {money(property.price / property.area, property.currency)}
          </span>
        ) : null,
    })
  }

  priceRows.push({
    id: "purpose",
    label: t("الغرض", "Purpose"),
    icon: Home,
    value: (property) => property.purpose,
    display: (property) => (
      <span
        className={cn(
          "inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold",
          property.purpose === "rent"
            ? "bg-brand-50 text-brand-700"
            : "bg-gold-200/70 text-ink-900",
        )}
      >
        {property.purpose === "rent" ? dict.common.forRent : dict.common.forSale}
      </span>
    ),
  })

  const layoutRows: RowDef[] = [
    {
      id: "area",
      label: dict.common.area,
      icon: Ruler,
      value: (property) => property.area,
      numeric: (property) => property.area,
      best: "max",
      display: (property) => `${property.area} ${dict.common.sqm}`,
    },
  ]

  if (items.some((property) => property.netArea !== undefined)) {
    layoutRows.push({
      id: "netArea",
      label: dict.common.netArea,
      icon: Ruler,
      value: (property) => property.netArea ?? null,
      numeric: (property) => property.netArea ?? null,
      best: "max",
      display: (property) =>
        property.netArea !== undefined ? `${property.netArea} ${dict.common.sqm}` : null,
    })
  }

  layoutRows.push(
    {
      id: "beds",
      label: dict.common.beds,
      icon: BedDouble,
      value: (property) => property.bedrooms,
      numeric: (property) => property.bedrooms,
      best: "max",
    },
    {
      id: "baths",
      label: dict.common.baths,
      icon: Bath,
      value: (property) => property.bathrooms,
      numeric: (property) => property.bathrooms,
      best: "max",
    },
    {
      id: "living",
      label: dict.common.livingRooms,
      icon: Sofa,
      value: (property) => property.livingRooms,
      numeric: (property) => property.livingRooms,
      best: "max",
    },
    {
      id: "parking",
      label: dict.common.parking,
      icon: Car,
      value: (property) => property.parking,
      numeric: (property) => property.parking,
      best: "max",
    },
  )

  if (items.some((property) => property.floorLabel || property.floor !== undefined)) {
    layoutRows.push({
      id: "floor",
      label: dict.common.floor,
      icon: Layers,
      value: (property) =>
        property.floorLabel?.[locale] ??
        (property.floor !== undefined ? String(property.floor) : null),
    })
  }

  if (items.some((property) => property.yearBuilt > 0)) {
    layoutRows.push({
      id: "year",
      label: dict.common.yearBuilt,
      icon: CalendarDays,
      value: (property) => (property.yearBuilt > 0 ? property.yearBuilt : null),
      numeric: (property) => (property.yearBuilt > 0 ? property.yearBuilt : null),
      best: "max",
    })
  }

  const featureRows: RowDef[] = []
  const pushFlag = (
    id: string,
    label: string,
    icon: typeof BedDouble,
    get: (property: Property) => boolean | undefined,
  ) => {
    if (items.some((property) => get(property) === true)) {
      featureRows.push({
        id,
        label,
        icon,
        value: (property) => get(property) === true,
        best: "true",
      })
    }
  }
  pushFlag("citizenship", dict.common.citizenshipEligibleShort, ShieldCheck, (p) => p.citizenshipEligible)
  pushFlag("installment", dict.common.installment, Banknote, (p) => p.installment)
  pushFlag("underConstruction", dict.common.underConstruction, Hammer, (p) => p.underConstruction)
  pushFlag("readyToMove", dict.common.readyToMove, Check, (p) => p.readyToMove)
  pushFlag("luxury", dict.common.luxury, Crown, (p) => p.luxury)
  pushFlag("seaView", dict.common.seaView, Waves, (p) => p.seaView)

  if (items.some((property) => property.side)) {
    featureRows.push({
      id: "side",
      label: t("جانب المدينة", "City side"),
      icon: MapPin,
      value: (property) => property.side ?? null,
      display: (property) =>
        property.side === "european"
          ? t("الأوروبي", "European")
          : property.side === "asian"
            ? t("الآسيوي", "Asian")
            : null,
    })
  }

  const amenityRows: RowDef[] = []
  const amenityKeys = (Object.keys(dict.amenities) as AmenityKey[]).filter((key) =>
    items.some((property) => property.amenities.includes(key)),
  )
  if (amenityKeys.length > 0) {
    amenityRows.push({
      id: "amenityCount",
      label: t("عدد المرافق", "Amenities"),
      icon: Sparkles,
      value: (property) => property.amenities.length,
      numeric: (property) => property.amenities.length,
      best: "max",
    })
    for (const key of amenityKeys) {
      amenityRows.push({
        id: `amenity-${key}`,
        label: dict.amenities[key],
        icon: Check,
        value: (property) => property.amenities.includes(key),
        best: "true",
      })
    }
  }

  const locationRows: RowDef[] = [
    {
      id: "city",
      label: dict.common.cityLabel,
      icon: MapPin,
      value: (property) => dict.cities[property.city],
    },
    {
      id: "address",
      label: t("العنوان", "Address"),
      icon: MapPin,
      value: (property) => property.address[locale] || null,
      display: (property) => (
        <span className="text-[11px] font-medium leading-5 text-slate-500">
          {property.address[locale]}
        </span>
      ),
    },
  ]

  const sections: SectionDef[] = [
    { id: "price", title: t("السعر", "Price"), icon: Banknote, rows: priceRows },
    { id: "layout", title: t("المساحة والتوزيع", "Space & layout"), icon: Ruler, rows: layoutRows },
    ...(featureRows.length
      ? [{ id: "features", title: t("المميزات", "Features"), icon: Sparkles, rows: featureRows }]
      : []),
    ...(amenityRows.length
      ? [
          {
            id: "amenities",
            title: t("المرافق والخدمات", "Amenities & services"),
            icon: Check,
            rows: amenityRows,
          },
        ]
      : []),
    { id: "location", title: t("الموقع", "Location"), icon: MapPin, rows: locationRows },
  ]

  const rawKey = (row: RowDef, property: Property) => {
    const value = row.value(property)
    if (value === null || value === undefined || value === "") return "—"
    if (typeof value === "boolean") return value ? "1" : "0"
    return String(value)
  }

  const visibleSections = sections
    .map((section) => ({
      ...section,
      rows: section.rows.filter((row) => {
        if (!differencesOnly) return true
        return new Set(items.map((property) => rawKey(row, property))).size > 1
      }),
    }))
    .filter((section) => section.rows.length > 0)

  const winnersFor = (row: RowDef): Set<number> => {
    const winners = new Set<number>()
    if (!row.best || items.length < 2) return winners

    if (row.best === "true") {
      const flags = items.map((property) => row.value(property) === true)
      if (flags.every(Boolean) || !flags.some(Boolean)) return winners
      flags.forEach((flag, index) => {
        if (flag) winners.add(index)
      })
      return winners
    }

    const numbers = items.map((property) => (row.numeric ? row.numeric(property) : null))
    const valid = numbers.filter(
      (value): value is number => value !== null && Number.isFinite(value),
    )
    if (valid.length < 2 || new Set(valid).size < 2) return winners
    const target = row.best === "min" ? Math.min(...valid) : Math.max(...valid)
    numbers.forEach((value, index) => {
      if (value !== null && value === target) winners.add(index)
    })
    return winners
  }

  // ------------------------------ verdict ------------------------------
  type Verdict = {
    id: string
    label: string
    icon: typeof BedDouble
    value: string
    property: Property
  }
  const verdicts: Verdict[] = []

  if (items.length > 1) {
    if (samePurpose) {
      const cheapest = [...items].sort((a, b) => priceValue(a) - priceValue(b))[0]
      verdicts.push({
        id: "price",
        label: isRent ? t("أقل إيجار", "Lowest rent") : t("أقل سعر", "Lowest price"),
        icon: Banknote,
        value: money(cheapest.price, cheapest.currency),
        property: cheapest,
      })
    }
    const withArea = items.filter((property) => property.area > 0)
    if (withArea.length > 1) {
      const bestPpm = [...withArea].sort(
        (a, b) => (ppmValue(a) ?? Infinity) - (ppmValue(b) ?? Infinity),
      )[0]
      verdicts.push({
        id: "ppm",
        label: t("أفضل سعر للمتر", "Best price / m²"),
        icon: Ruler,
        value: money(bestPpm.price / bestPpm.area, bestPpm.currency),
        property: bestPpm,
      })
    }
    const largest = [...items].sort((a, b) => b.area - a.area)[0]
    if (largest.area > 0) {
      verdicts.push({
        id: "area",
        label: t("أكبر مساحة", "Largest area"),
        icon: Scale,
        value: `${largest.area} ${dict.common.sqm}`,
        property: largest,
      })
    }
    const mostAmenities = [...items].sort(
      (a, b) => b.amenities.length - a.amenities.length,
    )[0]
    if (mostAmenities.amenities.length > 0) {
      verdicts.push({
        id: "amenities",
        label: t("الأكثر مرافق", "Most amenities"),
        icon: Sparkles,
        value: String(mostAmenities.amenities.length),
        property: mostAmenities,
      })
    }
    const citizenship = items.filter((property) => property.citizenshipEligible)
    if (citizenship.length > 0) {
      verdicts.push({
        id: "citizenship",
        label: t("مناسب للجنسية", "Citizenship"),
        icon: ShieldCheck,
        value: `${citizenship.length} / ${items.length}`,
        property: citizenship[0],
      })
    }
  }

  const bestValue =
    items.length > 1 && items.every((property) => property.area > 0)
      ? [...items].sort((a, b) => (ppmValue(a) ?? Infinity) - (ppmValue(b) ?? Infinity))[0]
      : null

  const share = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt(t("انسخ رابط المقارنة:", "Copy this comparison link:"), url)
    }
  }

  // ------------------------------ loading ------------------------------
  if (!mounted && items.length === 0 && initialSlugs.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-6 w-40 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-4 h-9 w-72 animate-pulse rounded-xl bg-slate-200" />
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-3xl bg-white ring-1 ring-slate-200/70"
            />
          ))}
        </div>
      </div>
    )
  }

  // ------------------------------ empty ------------------------------
  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200/70 sm:p-12">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-700">
            <Scale className="size-8" />
          </span>
          <h1 className="mt-5 font-heading text-2xl font-bold text-ink-900 sm:text-3xl">
            {t("قارن العقارات بذكاء", "Compare properties smartly")}
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm font-medium leading-7 text-slate-500">
            {t(
              "أضف حتى 4 عقارات إلى سلة المقارنة، ثم شاهد السعر والمساحة والمميزات والمرافق جنباً إلى جنب بوضوح.",
              "Add up to 4 listings to the comparison tray, then see price, space, features and amenities side by side, clearly.",
            )}
          </p>
          <Link
            href={`/${locale}/properties`}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-900/15 transition hover:bg-brand-700"
          >
            {t("تصفح العقارات", "Browse properties")}
            <ArrowUpRight className="size-4 rtl:-scale-x-100" />
          </Link>
        </div>

        {suggestions.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-2.5">
              <span className="h-px w-7 bg-gold-500" />
              <h2 className="font-heading text-lg font-bold text-ink-900">
                {t("ابدأ بأحد هذه العقارات", "Start with one of these")}
              </h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {suggestions.map((property) => (
                <div
                  key={property.slug}
                  className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm"
                >
                  <div className="relative aspect-[4/3] bg-slate-100">
                    {property.images[0] && (
                      <Image
                        src={property.images[0]}
                        alt={property.name[locale]}
                        fill
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 font-heading text-[13px] font-bold leading-snug text-ink-900">
                      {property.name[locale]}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                      <MapPin className="size-3 text-brand-600" />
                      {dict.cities[property.city]}
                    </p>
                    <button
                      type="button"
                      onClick={() => addCompare(toCompareEntry(property))}
                      className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-50 px-3 py-2 text-[11px] font-bold text-brand-700 transition hover:bg-brand-100"
                    >
                      <Plus className="size-3.5" />
                      {t("أضف للمقارنة", "Add to compare")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    )
  }

  const columnWidth = 232
  const tableMinWidth = 156 + items.length * columnWidth + emptySlots * 190

  // ------------------------------ table ------------------------------
  return (
    <section className="mx-auto max-w-7xl px-4 pb-28 pt-8 sm:px-6 md:pb-16 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700 ring-1 ring-brand-200/70">
            <Scale className="size-3.5" />
            {t("أداة المقارنة", "Comparison tool")}
          </span>
          <h1 className="mt-3 font-heading text-2xl font-bold text-ink-900 sm:text-3xl">
            {t("مقارنة العقارات", "Compare properties")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
            {t(
              "قارن حتى 4 عقارات: السعر، سعر المتر، المساحة، المميزات والمرافق — بترتيب واضح على كل شاشة.",
              "Compare up to 4 listings: price, price per m², space, features and amenities — clearly laid out on any screen.",
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={share}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-ink-800 transition hover:border-brand-300 hover:text-brand-700"
          >
            {copied ? (
              <>
                <Check className="size-4 text-emerald-600" />
                {t("تم النسخ", "Copied")}
              </>
            ) : (
              <>
                <Share2 className="size-4" />
                {t("مشاركة", "Share")}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => clearCompare()}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 className="size-4" />
            {t("مسح الكل", "Clear all")}
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white p-2.5 shadow-sm">
        <div className="flex items-center gap-2.5 px-1">
          <span className="grid size-8 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <Columns3 className="size-4" />
          </span>
          <div>
            <p className="text-[11px] font-bold text-ink-900">
              {items.length} / {COMPARE_MAX}{" "}
              {t("عقارات في المقارنة", "properties compared")}
            </p>
            <div className="mt-1 flex gap-1">
              {Array.from({ length: COMPARE_MAX }).map((_, index) => (
                <span
                  key={index}
                  className={cn(
                    "h-1 w-5 rounded-full transition",
                    index < items.length ? "bg-brand-600" : "bg-slate-200",
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={differencesOnly}
          onClick={() => setDifferencesOnly((value) => !value)}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold transition",
            differencesOnly
              ? "border-brand-300 bg-brand-50 text-brand-700"
              : "border-slate-200 bg-white text-slate-500 hover:text-ink-900",
          )}
        >
          <span
            className={cn(
              "relative h-4 w-7 rounded-full transition",
              differencesOnly ? "bg-brand-600" : "bg-slate-300",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-3 rounded-full bg-white transition-all",
                differencesOnly ? "start-3.5" : "start-0.5",
              )}
            />
          </span>
          {t("الفروقات فقط", "Differences only")}
        </button>
      </div>

      {/* Mobile: summary + one stacked card per listing (md:hidden) */}
      <div className="mt-4 space-y-3 md:hidden">
        {items.length > 1 && verdicts.length > 0 && (
          <div className="rounded-2xl border border-slate-200/70 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="size-3.5 text-gold-600" />
              <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                {t("خلاصة المقارنة", "Comparison summary")}
              </h2>
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              {verdicts.slice(0, 4).map((verdict) => (
                <div
                  key={verdict.id}
                  className="min-w-0 rounded-xl bg-sand-50/70 p-2.5 ring-1 ring-slate-200/60"
                >
                  <p className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                    <verdict.icon className="size-3 shrink-0 text-brand-600" />
                    {verdict.label}
                  </p>
                  <p className="mt-1 font-heading text-[15px] font-bold leading-none text-ink-900">
                    {verdict.value}
                  </p>
                  <p className="mt-1 truncate text-[10px] font-semibold text-slate-500">
                    {verdict.property.name[locale]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {items.map((property, index) => {
          const whatsapp = (
            property.advertiser?.whatsapp ??
            (property.purpose === "rent"
              ? defaultRentAdvertiser.whatsapp
              : property.agent.phone)
          ).replace(/\D/g, "")
          const whatsappHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent(
            locale === "ar"
              ? `مرحباً! أرغب بمعرفة المزيد عن: ${property.name.ar}`
              : `Hello! I'd like to know more about: ${property.name.en}`,
          )}`

          return (
            <article
              key={property.slug}
              className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm"
            >
              <div className="flex gap-2.5 p-2.5">
                <div className="relative h-[72px] w-[92px] shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {property.images[0] && (
                    <Image
                      src={property.images[0]}
                      alt={property.name[locale]}
                      fill
                      sizes="92px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-1.5">
                    <Link
                      href={`/${locale}/properties/${property.slug}`}
                      className="line-clamp-2 font-heading text-[13px] font-bold leading-snug text-ink-900 transition hover:text-brand-700"
                    >
                      {property.name[locale]}
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeCompare(property.slug)}
                      aria-label={t("إزالة من المقارنة", "Remove from comparison")}
                      className="grid size-6 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-rose-500 hover:text-white"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                    <MapPin className="size-3 shrink-0 text-brand-600" />
                    <span className="truncate">{dict.cities[property.city]}</span>
                    <span className="text-slate-300">•</span>
                    <span
                      className={cn(
                        "font-bold",
                        property.purpose === "rent" ? "text-brand-700" : "text-gold-600",
                      )}
                    >
                      {property.purpose === "rent"
                        ? dict.common.forRent
                        : dict.common.forSale}
                    </span>
                  </p>
                  <p className="mt-1.5 font-heading text-[15px] font-bold leading-none text-ink-900">
                    {money(property.price, property.currency)}
                    {property.pricePerMonth && (
                      <span className="text-[10px] font-medium text-slate-400">
                        {" "}
                        / {t("شهر", "mo")}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 pb-2.5">
                <Link
                  href={`/${locale}/properties/${property.slug}`}
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-ink-900 px-2 py-2 text-[11px] font-bold text-white transition hover:bg-ink-800"
                >
                  {t("التفاصيل", "Details")}
                  <ArrowUpRight className="size-3 rtl:-scale-x-100" />
                </Link>
                <FavoriteButton slug={property.slug} compact dict={dict} />
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={dict.common.whatsapp}
                  className="grid size-8 place-items-center rounded-full bg-gold-400 text-ink-950 transition hover:bg-gold-300"
                >
                  <WhatsAppIcon className="size-4" />
                </a>
              </div>

              <div className="border-t border-slate-100">
                {visibleSections.map((section) => (
                  <div key={section.id}>
                    <div className="flex items-center gap-1.5 bg-sand-50/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                      <section.icon className="size-3 shrink-0 text-brand-600" />
                      {section.title}
                    </div>
                    <dl className="divide-y divide-slate-100">
                      {section.rows.map((row) => {
                        const winner = winnersFor(row).has(index)
                        const raw = row.value(property)
                        return (
                          <div
                            key={row.id}
                            className={cn(
                              "flex items-center justify-between gap-3 px-3 py-1.5",
                              winner && "bg-emerald-50/60",
                            )}
                          >
                            <dt className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                              <row.icon className="size-3.5 shrink-0 text-slate-400" />
                              <span className="truncate">{row.label}</span>
                            </dt>
                            <dd className="flex min-w-0 items-center justify-end text-end text-[12px] font-bold text-ink-900">
                              {winner && (
                                <Star className="me-1 size-3 shrink-0 fill-emerald-500 text-emerald-500" />
                              )}
                              <span className={cn("min-w-0", winner && "text-emerald-700")}>
                                {row.display ? (
                                  row.display(property, raw)
                                ) : raw === null || raw === undefined || raw === "" ? (
                                  <span className="text-slate-300">—</span>
                                ) : typeof raw === "boolean" ? (
                                  raw ? (
                                    <Check className="inline size-3.5 text-emerald-600" />
                                  ) : (
                                    <span className="text-slate-300">—</span>
                                  )
                                ) : (
                                  String(raw)
                                )}
                              </span>
                            </dd>
                          </div>
                        )
                      })}
                    </dl>
                  </div>
                ))}
              </div>
            </article>
          )
        })}

        {visibleSections.length === 0 && (
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200/70">
            <Check className="mx-auto size-8 text-emerald-500" />
            <p className="mt-2 text-sm font-bold text-ink-900">
              {t("لا توجد فروقات", "No differences")}
            </p>
          </div>
        )}

        {items.length < COMPARE_MAX && (
          <Link
            href={`/${locale}/properties`}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 px-4 py-3 text-xs font-bold text-slate-400 transition hover:border-brand-300 hover:bg-brand-50/40 hover:text-brand-700"
          >
            <Plus className="size-4" />
            {t("أضف عقاراً للمقارنة", "Add a listing to compare")}
          </Link>
        )}
      </div>

      {/* Desktop: table (hidden on mobile) */}
      <div className="hidden md:block">
        <div className="mt-4 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70">
          <div className="overflow-x-auto snap-x snap-mandatory scroll-smooth [-webkit-overflow-scrolling:touch]">
          <table className="w-full border-separate border-spacing-0" style={{ minWidth: 300 }}>
            <thead className="sticky top-14 z-30">
              <tr>
                <th
                  scope="col"
                  className="sticky start-0 z-20 w-[80px] min-w-[80px] border-b border-e border-slate-200 bg-sand-50 p-2 align-bottom sm:w-[100px] sm:min-w-[100px] md:w-[132px] md:min-w-[132px] lg:w-[156px] lg:min-w-[156px]"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    {t("المواصفة", "Spec")}
                  </p>
                  <p className="mt-1 font-heading text-sm font-bold text-ink-900">
                    {items.length} {t("عقارات", "listings")}
                  </p>
                </th>

                {items.map((property) => {
                  const whatsapp = (
                    property.advertiser?.whatsapp ??
                    (property.purpose === "rent"
                      ? defaultRentAdvertiser.whatsapp
                      : property.agent.phone)
                  ).replace(/\D/g, "")
                  const whatsappHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent(
                    locale === "ar"
                      ? `مرحباً! أرغب بمعرفة المزيد عن: ${property.name.ar}`
                      : `Hello! I'd like to know more about: ${property.name.en}`,
                  )}`
                  const ppm =
                    property.area > 0
                      ? money(property.price / property.area, property.currency)
                      : null

                  return (
                    <th
                      key={property.slug}
                      scope="col"
                      className="snap-start border-b border-slate-200 p-2 align-top sm:p-2.5"
                      style={{ width: 150, minWidth: 150 }}
                    >
                      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
                        <div className="relative aspect-square overflow-hidden bg-slate-100 sm:aspect-[4/3]">
                          {property.images[0] && (
                            <Image
                              src={property.images[0]}
                              alt={property.name[locale]}
                              fill
                              sizes="232px"
                              className="object-cover"
                            />
                          )}
                          <span
                            className={cn(
                              "absolute start-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide backdrop-blur",
                              property.purpose === "rent"
                                ? "bg-brand-500/90 text-white"
                                : "bg-gold-500/90 text-ink-950",
                            )}
                          >
                            {property.purpose === "rent"
                              ? dict.common.forRent
                              : dict.common.forSale}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeCompare(property.slug)}
                            aria-label={t("إزالة من المقارنة", "Remove from comparison")}
                            className="absolute end-2 top-2 grid size-7 place-items-center rounded-full bg-white/90 text-slate-600 shadow-sm backdrop-blur transition hover:bg-rose-500 hover:text-white"
                          >
                            <X className="size-4" />
                          </button>
                        </div>

                        <div className="p-2 sm:p-2.5">
                          <Link
                            href={`/${locale}/properties/${property.slug}`}
                            className="line-clamp-2 font-heading text-[13px] font-bold leading-snug text-ink-900 transition hover:text-brand-700"
                          >
                            {property.name[locale]}
                          </Link>
                          <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                            <MapPin className="size-3 text-brand-600" />
                            {dict.cities[property.city]}
                          </p>
                          <p className="mt-2 font-heading text-base font-bold leading-none text-ink-900">
                            {money(property.price, property.currency)}
                            {property.pricePerMonth && (
                              <span className="text-[10px] font-medium text-slate-400">
                                {" "}
                                / {t("شهر", "mo")}
                              </span>
                            )}
                          </p>
                          {ppm && (
                            <p className="mt-1 text-[10px] font-semibold text-slate-400">
                              {ppm} / {dict.common.sqm}
                            </p>
                          )}

                          <div className="mt-2.5 flex items-center gap-1.5 border-t border-slate-100 pt-2">
                            <Link
                              href={`/${locale}/properties/${property.slug}`}
                              className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-ink-900 px-2 py-1.5 text-[10px] font-bold text-white transition hover:bg-ink-800"
                            >
                              {t("التفاصيل", "Details")}
                              <ArrowUpRight className="size-3 rtl:-scale-x-100" />
                            </Link>
                            <FavoriteButton slug={property.slug} compact dict={dict} />
                            <a
                              href={whatsappHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={dict.common.whatsapp}
                              className="grid size-8 place-items-center rounded-full bg-gold-400 text-ink-950 transition hover:bg-gold-300"
                            >
                              <WhatsAppIcon className="size-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </th>
                  )
                })}

                {Array.from({ length: emptySlots }).map((_, index) => (
                  <th
                    key={`empty-${index}`}
                    scope="col"
                    className="hidden snap-start border-b border-slate-200 p-2 align-top sm:table-cell sm:p-2.5"
                    style={{ width: 140, minWidth: 140 }}
                  >
                    <Link
                      href={`/${locale}/properties`}
                      className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 transition hover:border-brand-300 hover:bg-brand-50/40 hover:text-brand-700 sm:min-h-[280px]"
                    >
                      <Plus className="size-6" />
                      <span className="text-xs font-bold">
                        {t("أضف عقاراً", "Add a listing")}
                      </span>
                      <span className="text-[10px] font-semibold">
                        {COMPARE_MAX - items.length - index} {t("مقاعد متبقية", "slots left")}
                      </span>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {visibleSections.map((section) => (
                <Fragment key={section.id}>
                  <tr>
                    <td
                      colSpan={1 + items.length + emptySlots}
                      className="border-b border-slate-100 bg-sand-50/80 px-3 py-2"
                    >
                      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                        <section.icon className="size-3.5 text-brand-600" />
                        {section.title}
                      </div>
                    </td>
                  </tr>

                  {section.rows.map((row) => {
                    const winners = winnersFor(row)
                    return (
                      <tr key={row.id} className="group">
                        <th
                          scope="row"
                          className="sticky start-0 z-10 w-[80px] min-w-[80px] border-b border-e border-slate-100 bg-white px-2 py-2.5 text-start align-middle transition group-hover:bg-sand-50 sm:w-[100px] sm:min-w-[100px] sm:px-3"
                        >
                          <span className="flex items-center gap-2 text-[12px] font-semibold text-slate-500">
                            <row.icon className="size-3.5 shrink-0 text-slate-400" />
                            {row.label}
                          </span>
                        </th>
                        {items.map((property, index) => (
                          <td
                            key={property.slug}
                            className={cn(
                              "snap-start border-b border-slate-100 px-2 py-2.5 align-middle text-[13px] font-semibold text-ink-900 sm:px-3",
                              winners.has(index) && "bg-emerald-50/60",
                            )}
                          >
                            <CompareCell
                              row={row}
                              property={property}
                              winner={winners.has(index)}
                              t={t}
                            />
                          </td>
                        ))}
                        {Array.from({ length: emptySlots }).map((_, index) => (
                          <td key={`empty-cell-${index}`} className="hidden border-b border-slate-100 sm:table-cell" />
                        ))}
                      </tr>
                    )
                  })}
                </Fragment>
              ))}

              {visibleSections.length === 0 && (
                <tr>
                  <td
                    colSpan={1 + items.length + emptySlots}
                    className="px-4 py-10 text-center"
                  >
                    <Check className="mx-auto size-8 text-emerald-500" />
                    <p className="mt-2 text-sm font-bold text-ink-900">
                      {t("لا توجد فروقات", "No differences")}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {t(
                        "العقارات متطابقة في البيانات المعروضة. أطفئ «الفروقات فقط» لعرض كل المواصفات.",
                        "These listings match on the displayed data. Turn off “Differences only” to see every spec.",
                      )}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      {bestValue && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-gold-300/70 bg-gold-200/25 p-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gold-400 text-ink-950">
            <Sparkles className="size-4.5" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold-600">
              {t("توصية إسكان", "Iskan pick")}
            </p>
            <p className="mt-1 text-sm font-semibold leading-6 text-ink-900">
              {locale === "ar"
                ? `${bestValue.name.ar} يقدّم أفضل سعر للمتر المربع بين المعروضات.`
                : `${bestValue.name.en} offers the best price per m² in this comparison.`}
            </p>
            <Link
              href={`/${locale}/properties/${bestValue.slug}`}
              className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-brand-700 transition hover:text-brand-800"
            >
              {t("عرض العقار", "View listing")}
              <ArrowUpRight className="size-3.5 rtl:-scale-x-100" />
            </Link>
          </div>
        </div>
      )}

      {verdicts.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2.5">
            <span className="h-px w-7 bg-gold-500" />
            <h2 className="font-heading text-lg font-bold text-ink-900">
              {t("الخلاصة", "At a glance")}
            </h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {verdicts.map((verdict) => (
              <div
                key={verdict.id}
                className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm"
              >
                <span className="grid size-8 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <verdict.icon className="size-4" />
                </span>
                <p className="mt-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  {verdict.label}
                </p>
                <p className="mt-1 font-heading text-lg font-bold leading-none text-ink-900">
                  {verdict.value}
                </p>
                <Link
                  href={`/${locale}/properties/${verdict.property.slug}`}
                  className="mt-1.5 block truncate text-[11px] font-semibold text-brand-700 transition hover:text-brand-800"
                >
                  {verdict.property.name[locale]}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="h-px w-7 bg-gold-500" />
              <h2 className="font-heading text-lg font-bold text-ink-900">
                {t("أضف عقارات أخرى", "Add more listings")}
              </h2>
            </div>
            <Link
              href={`/${locale}/properties`}
              className="text-xs font-bold text-brand-700 transition hover:text-brand-800"
            >
              {dict.common.viewAll}
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {suggestions.map((property) => (
              <button
                key={property.slug}
                type="button"
                onClick={() => addCompare(toCompareEntry(property))}
                className="group flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white p-2.5 text-start shadow-sm transition hover:border-brand-300 hover:shadow-md"
              >
                <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {property.images[0] && (
                    <Image
                      src={property.images[0]}
                      alt={property.name[locale]}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 block font-heading text-[12px] font-bold text-ink-900">
                    {property.name[locale]}
                  </span>
                  <span className="mt-0.5 block text-[10px] font-semibold text-slate-400">
                    {dict.cities[property.city]}
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-[11px] font-bold text-brand-700">
                    <Plus className="size-3" />
                    {t("أضف للمقارنة", "Add to compare")}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
