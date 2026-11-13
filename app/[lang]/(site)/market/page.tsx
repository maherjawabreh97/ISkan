import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Building2,
  Calculator,
  MapPin,
  Ruler,
  TrendingUp,
} from "lucide-react"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"
import { getProperties } from "@/lib/properties-store"
import { convertPrice } from "@/lib/currency"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const locale = hasLocale(lang) ? lang : "ar"
  const isAr = locale === "ar"
  return {
    title: isAr ? "مؤشرات سوق العقارات في إسطنبول" : "Istanbul property market insights",
    description: isAr
      ? "متوسط أسعار العقارات وسعر المتر المربع حسب الأحياء في إسطنبول، محسوبة من الإعلانات المنشورة."
      : "Average property prices and price per m² by district in Istanbul, calculated from published listings.",
  }
}

const nf = (value: number, digits = 0) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(
    Number.isFinite(value) ? value : 0,
  )

export default async function MarketPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const isAr = locale === "ar"
  const dict = await getDictionary(locale)

  const properties = await getProperties()
  const sale = properties.filter((property) => property.purpose === "sale")

  const toTry = (value: number, currency?: string) =>
    convertPrice(value, currency ?? "TRY", "TRY")

  const salePrices = sale.map((property) => toTry(property.price, property.currency))
  const avgSale =
    salePrices.length > 0
      ? salePrices.reduce((sum, value) => sum + value, 0) / salePrices.length
      : 0

  const perM2 = sale
    .filter((property) => property.area > 0)
    .map((property) => toTry(property.price, property.currency) / property.area)
  const avgPerM2 =
    perM2.length > 0 ? perM2.reduce((sum, value) => sum + value, 0) / perM2.length : 0

  // Group sale listings by district.
  const byCity = new Map<
    string,
    { count: number; prices: number[]; perM2: number[] }
  >()
  for (const property of sale) {
    const entry = byCity.get(property.city) ?? {
      count: 0,
      prices: [],
      perM2: [],
    }
    entry.count += 1
    entry.prices.push(toTry(property.price, property.currency))
    if (property.area > 0) {
      entry.perM2.push(toTry(property.price, property.currency) / property.area)
    }
    byCity.set(property.city, entry)
  }

  const rows = [...byCity.entries()]
    .map(([city, entry]) => ({
      city,
      count: entry.count,
      avgPrice:
        entry.prices.reduce((sum, value) => sum + value, 0) / entry.prices.length,
      avgPerM2:
        entry.perM2.length > 0
          ? entry.perM2.reduce((sum, value) => sum + value, 0) / entry.perM2.length
          : 0,
    }))
    .sort((a, b) => b.avgPerM2 - a.avgPerM2)

  const maxPerM2 = Math.max(...rows.map((row) => row.avgPerM2), 1)

  const stats = [
    {
      icon: Building2,
      label: isAr ? "إجمالي الإعلانات" : "Total listings",
      value: nf(properties.length),
    },
    {
      icon: TrendingUp,
      label: isAr ? "متوسط سعر البيع" : "Average sale price",
      value: `${nf(avgSale)} ₺`,
    },
    {
      icon: Ruler,
      label: isAr ? "متوسط سعر المتر" : "Average price / m²",
      value: `${nf(avgPerM2)} ₺`,
    },
    {
      icon: MapPin,
      label: isAr ? "أحياء مغطاة" : "Districts covered",
      value: nf(rows.length),
    },
  ]

  return (
    <>
      <section className="relative overflow-hidden bg-ink-950 py-10 text-white lg:py-12">
        <div className="bg-grid-dark absolute inset-0 opacity-30" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <span className="block h-px w-7 bg-gold-500" />
          <h1 className="mt-4 font-heading text-2xl font-bold sm:text-3xl">
            {isAr ? "مؤشرات سوق إسطنبول" : "Istanbul market insights"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-medium text-white/60">
            {isAr
              ? "أرقام محسوبة مباشرة من الإعلانات المنشورة على إسكان، بالليرة التركية."
              : "Figures calculated directly from listings published on Iskan, in Turkish lira."}
          </p>
        </div>
      </section>

      <section className="py-10 lg:py-12">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70"
              >
                <span className="grid size-9 place-items-center rounded-xl bg-sand-100 text-brand-700">
                  <stat.icon className="size-4.5" />
                </span>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  {stat.label}
                </p>
                <p className="mt-1 font-heading text-lg font-bold text-ink-900">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {rows.length > 0 ? (
            <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="font-heading text-base font-bold text-ink-900">
                  {isAr ? "متوسط السعر حسب الحي" : "Average price by district"}
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  {isAr
                    ? "مرتبة تنازلياً حسب سعر المتر المربع."
                    : "Sorted by price per m², highest first."}
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <Link
                    key={row.city}
                    href={`/${locale}/properties?city=${row.city}&purpose=sale`}
                    className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-sand-50"
                  >
                    <div className="w-28 shrink-0 sm:w-40">
                      <p className="truncate font-heading text-sm font-bold text-ink-900">
                        {dict.cities[row.city as keyof typeof dict.cities]}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-400">
                        {row.count}{" "}
                        {isAr ? "إعلان" : row.count === 1 ? "listing" : "listings"}
                      </p>
                    </div>

                    <div className="hidden flex-1 sm:block">
                      <div className="h-2 overflow-hidden rounded-full bg-sand-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-gold-400"
                          style={{
                            width: `${Math.max(
                              (row.avgPerM2 / maxPerM2) * 100,
                              4,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="ms-auto shrink-0 text-end">
                      <p className="font-heading text-sm font-bold text-ink-900">
                        {nf(row.avgPerM2)} ₺/m²
                      </p>
                      <p className="text-[11px] font-semibold text-slate-400">
                        {nf(row.avgPrice)} ₺
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl bg-white px-6 py-14 text-center ring-1 ring-slate-200/70">
              <p className="text-sm font-semibold text-slate-500">
                {isAr
                  ? "لا توجد إعلانات بيع كافية لحساب المؤشرات بعد."
                  : "Not enough sale listings yet to calculate insights."}
              </p>
            </div>
          )}

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link
              href={`/${locale}/calculator`}
              className="group flex items-center gap-4 rounded-2xl bg-gradient-to-br from-brand-900 to-ink-950 p-5 text-white"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10 text-gold-300">
                <Calculator className="size-5" />
              </span>
              <span>
                <span className="block font-heading text-sm font-bold">
                  {isAr ? "حاسبة الاستثمار" : "Investment calculator"}
                </span>
                <span className="mt-0.5 block text-xs text-white/60">
                  {isAr
                    ? "احسب العائد والدفعة الشهرية."
                    : "Work out yield and monthly payment."}
                </span>
              </span>
            </Link>
            <Link
              href={`/${locale}/properties`}
              className="group flex items-center gap-4 rounded-2xl bg-white p-5 ring-1 ring-slate-200/70 transition hover:ring-brand-300"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sand-100 text-brand-700">
                <Building2 className="size-5" />
              </span>
              <span>
                <span className="block font-heading text-sm font-bold text-ink-900">
                  {dict.nav.properties}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {isAr
                    ? "تصفح كل العقارات المتاحة."
                    : "Browse every available property."}
                </span>
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
