// @ts-nocheck
import Link from "next/link"
import { notFound } from "next/navigation"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"
import { getProperties } from "@/lib/properties-store"
import { formatPrice } from "@/lib/format"

// @ts-nocheck
export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ slugs?: string }>
}

export default async function ComparePage({ params, searchParams }: PageProps) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const dict = await getDictionary(locale)
  const query = await searchParams
  const slugs = (query.slugs ?? "").split(",").filter(Boolean)
  const all = await getProperties()
  const items = slugs
    .map((s) => all.find((p) => p.slug === s))
    .filter(Boolean)

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
        <h1 className="font-heading text-2xl font-bold text-ink-900">
          {locale === "ar" ? "لا توجد عقارات للمقارنة" : "No properties to compare"}
        </h1>
        <Link
          href={`/${locale}/properties`}
          className="mt-6 inline-flex rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white"
        >
          {dict.common.viewAll}
        </Link>
      </section>
    )
  }

  // Collect which feature flags are set across all items
  const has: Record<string, boolean> = {}
  items.forEach((p) => {
    has.citizenshipEligible = has.citizenshipEligible || p.citizenshipEligible
    has.installment = has.installment || p.installment
    has.underConstruction = has.underConstruction || p.underConstruction
    has.readyToMove = has.readyToMove || p.readyToMove
    has.luxury = has.luxury || p.luxury
    has.seaView = has.seaView || p.seaView
    if (p.side) has[p.side] = true
  })

  // Build the rows array - base rows + feature rows
  const rows: Array<{ label: string; value: (p: typeof items[0]) => string }> = [
    { label: dict.common.price, value: (p) => formatPrice(p.price, p.currency) },
    { label: dict.common.cityLabel, value: (p) => dict.cities[p.city] },
    { label: dict.common.propertyType, value: (p) => dict.propertyTypes[p.type] },
    { label: dict.common.beds, value: (p) => String(p.bedrooms) },
    { label: dict.common.baths, value: (p) => String(p.bathrooms) },
    { label: dict.common.livingRooms, value: (p) => String(p.livingRooms) },
    { label: dict.common.area, value: (p) => `${p.area} ${dict.common.sqm}` },
    { label: dict.common.parking, value: (p) => String(p.parking) },
    { label: dict.common.yearBuilt, value: (p) => (p.yearBuilt ? String(p.yearBuilt) : "—") },
    { label: dict.common.floor, value: (p) => p.floorLabel?.[locale] ?? (p.floor !== undefined ? String(p.floor) : "—") },
  ]

  // Add citizenship row if any property is eligible
  const hasCitizenship = items.some((p) => p.citizenshipEligible)
  if (hasCitizenship) {
    rows.push({
      label: locale === "ar" ? "مناسب للجنسية" : "Citizenship",
      value: (p) => (p.citizenshipEligible ? "✓" : "—"),
    })
  }

  // Add installment row if any property has installment
  const hasInstallment = items.some((p) => p.installment)
  if (hasInstallment) {
    rows.push({
      label: locale === "ar" ? "بالتقسيط" : "Installment",
      value: (p) => (p.installment ? "✓" : "—"),
    })
  }

  // Add under construction row if any property is under construction
  const hasUnderConstruction = items.some((p) => p.underConstruction)
  if (hasUnderConstruction) {
    rows.push({
      label: locale === "ar" ? "قيد الإنشاء" : "Under construction",
      value: (p) => (p.underConstruction ? "✓" : "—"),
    })
  }

  // Add ready to move row if any property is ready
  const hasReadyToMove = items.some((p) => p.readyToMove)
  if (hasReadyToMove) {
    rows.push({
      label: locale === "ar" ? "جاهز للسكن" : "Ready to move",
      value: (p) => (p.readyToMove ? "✓" : "—"),
    })
  }

  // Add luxury row if any property is luxury
  const hasLuxury = items.some((p) => p.luxury)
  if (hasLuxury) {
    rows.push({
      label: locale === "ar" ? "فاخر" : "Luxury",
      value: (p) => (p.luxury ? "✓" : "—"),
    })
  }

  // Add sea view row if any property has sea view
  const hasSeaView = items.some((p) => p.seaView)
  if (hasSeaView) {
    rows.push({
      label: locale === "ar" ? "مناظر بحرية" : "Sea view",
      value: (p) => (p.seaView ? "✓" : "—"),
    })
  }

  // Add side row if any property has a side
  const hasEuropean = items.some((p) => p.side === "european")
  const hasAsian = items.some((p) => p.side === "asian")
  if (hasEuropean || hasAsian) {
    rows.push({
      label: locale === "ar" ? "الجانب" : "Side",
      value: (p) =>
        p.side === "european"
          ? locale === "ar"
            ? "الأوروبي"
            : "European side"
          : locale === "ar"
            ? "الآسيوي"
            : "Asian side",
    })
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-2xl font-bold text-ink-900 sm:text-3xl">
        {locale === "ar" ? "مقارنة العقارات" : "Compare properties"}
      </h1>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse rounded-lg overflow-shadow-sm">
          <thead>
            <tr>
              <th className="p-3 text-start text-xs font-bold uppercase tracking-wider text-slate-400 bg-sand-50">
                {locale === "ar" ? "المواصفة" : "Spec"}
              </th>
              {items.map((p) => (
                <th key={p.slug} className="p-3 text-start">
                  <div className="flex flex-col gap-2">
                    {p.images[0] && (
                      <div
                        className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100"
                      >
                        <img
                          src={p.images[0]}
                          alt={p.name[locale]}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    )}
                    <Link
                      href={`/${locale}/properties/${p.slug}`}
                      className="font-heading text-sm font-bold text-ink-900 hover:text-brand-700 transition-colors duration-300"
                    >
                      {p.name[locale]}
                    </Link>
                    <span className="text-xs text-slate-500">{dict.cities[p.city]}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-slate-100">
                <td className="p-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                  {row.label}
                </td>
                {items.map((p) => (
                  <td key={p.slug} className="p-3 text-sm font-semibold text-ink-900">
                    {row.value(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.length > 1 && (
        <div className="mt-8 pt-8 border-t border-slate-100">
          <h2 className="font-heading text-base font-bold text-ink-900">
            {locale === "ar" ? "ملخص الاختلافات" : "Key differences"}
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white p-3 rounded-xl shadow-sm ring-1 ring-slate-200/70">
              <p className="font-bold text-ink-900">
                {locale === "ar" ? "الأعلى سعراً" : "Highest price"}
              </p>
              <p className="mt-1 font-semibold text-brand-600">
                {formatPrice(
                  Math.max(...items.map((p) => p.price)),
                  items.find((p) => p.price === Math.max(...items.map((p) => p.price)))!.currency
                )}
              </p>
            </div>
            <div className="bg-white p-3 rounded-xl shadow-sm ring-1 ring-slate-200/70">
              <p className="font-bold text-ink-900">
                {locale === "ar" ? "أكبر مساحة" : "Largest area"}
              </p>
              <p className="mt-1 font-semibold text-emerald-600">
                {Math.max(...items.map((p) => p.area))} {dict.common.sqm}
              </p>
            </div>
            {hasCitizenship && (
              <div className="bg-white p-3 rounded-xl shadow-sm ring-1 ring-slate-200/70">
                <p className="font-bold text-ink-900">
                  {locale === "ar" ? "مناسب للجنسية" : "Citizenship eligible"}
                </p>
                <p className="mt-1 font-semibold text-emerald-600">
                  {items.filter((p) => p.citizenshipEligible).length} من {items.length}
                </p>
              </div>
            )}
            {hasInstallment && (
              <div className="bg-white p-3 rounded-xl shadow-sm ring-1 ring-slate-200/70">
                <p className="font-bold text-ink-900">
                  {locale === "ar" ? "بالتقسيط" : "Installment"}
                </p>
                <p className="mt-1 font-semibold text-blue-600">
                  {items.filter((p) => p.installment).length} من {items.length}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}