import Link from "next/link"
import { notFound } from "next/navigation"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"
import { getProperties } from "@/lib/properties-store"
import { formatPrice } from "@/lib/format"
import { PropertyCard } from "@/components/property-card"

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
    .filter(Boolean) as typeof all

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

  const rows: { label: string; value: (p: (typeof items)[0]) => string }[] = [
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
    {
      label: locale === "ar" ? "مناسب للجنسية" : "Citizenship",
      value: (p) => (p.citizenshipEligible ? "✓" : "—"),
    },
    {
      label: locale === "ar" ? "بالتقسيط" : "Installment",
      value: (p) => (p.installment ? "✓" : "—"),
    },
    {
      label: locale === "ar" ? "قيد الإنشاء" : "Under construction",
      value: (p) => (p.underConstruction ? "✓" : "—"),
    },
    {
      label: locale === "ar" ? "جاهز للسكن" : "Ready to move",
      value: (p) => (p.readyToMove ? "✓" : "—"),
    },
  ]

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-2xl font-bold text-ink-900 sm:text-3xl">
        {locale === "ar" ? "مقارنة العقارات" : "Compare properties"}
      </h1>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr>
              <th className="p-3 text-start text-xs font-bold uppercase tracking-wider text-slate-400">
                {locale === "ar" ? "المواصفة" : "Spec"}
              </th>
              {items.map((p) => (
                <th key={p.slug} className="p-3 text-start">
                  <div className="flex flex-col gap-2">
                    {p.images[0] && (
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100">
                        <img src={p.images[0]} alt={p.name[locale]} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <Link
                      href={`/${locale}/properties/${p.slug}`}
                      className="font-heading text-sm font-bold text-ink-900 hover:text-brand-700"
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
    </section>
  )
}
