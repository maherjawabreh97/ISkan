import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react"
import { PropertyCard } from "@/components/property-card"
import {
  PropertyFilters,
  type FilterState,
} from "@/components/property-filters"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"
import { properties } from "@/lib/properties"

type PageProps = {
  params: Promise<{ lang: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params
  const locale = hasLocale(lang) ? lang : "ar"
  const dict = await getDictionary(locale)
  return {
    title: dict.meta.propertiesTitle,
    description: dict.meta.propertiesDescription,
  }
}

export default async function PropertiesPage({
  params,
  searchParams,
}: PageProps) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const dict = await getDictionary(locale)

  const sp = await searchParams
  const read = (key: string): string =>
    typeof sp[key] === "string" ? (sp[key] as string) : ""

  const rawQ = read("q").trim().toLowerCase()
  const rawCity = read("city")
  const rawType = read("type")
  const rawPurpose = read("purpose")
  const rawMin = Number(read("minPrice"))
  const rawMax = Number(read("maxPrice"))
  const sort = read("sort") || "newest"

  const city = Object.keys(dict.cities).includes(rawCity) && rawCity !== "all" ? rawCity : ""
  const type =
    Object.keys(dict.propertyTypes).includes(rawType) && rawType !== "all"
      ? rawType
      : ""
  const purpose = rawPurpose === "sale" || rawPurpose === "rent" ? rawPurpose : ""

  const minPrice = Number.isFinite(rawMin) && rawMin > 0 ? rawMin : 0
  const maxPrice = Number.isFinite(rawMax) && rawMax > 0 ? rawMax : 0

  let list = properties.filter((property) => {
    if (rawQ) {
      const haystack = [
        property.name[locale],
        property.address[locale],
        dict.cities[property.city],
        dict.propertyTypes[property.type],
      ]
        .join(" ")
        .toLowerCase()
      if (!haystack.includes(rawQ)) return false
    }
    if (city && property.city !== city) return false
    if (type && property.type !== type) return false
    if (purpose && property.purpose !== purpose) return false
    if (property.price < minPrice) return false
    if (maxPrice > 0 && property.price > maxPrice) return false
    return true
  })

  if (sort === "price-asc") {
    list = [...list].sort((a, b) => a.price - b.price)
  } else if (sort === "price-desc") {
    list = [...list].sort((a, b) => b.price - a.price)
  } else {
    list = [...list].sort(
      (a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
    )
  }

  const initial: FilterState = {
    q: read("q"),
    city: rawCity && city ? rawCity : "all",
    type: rawType && type ? rawType : "all",
    purpose: rawPurpose && purpose ? rawPurpose : "all",
    minPrice: minPrice > 0 ? String(minPrice) : "",
    maxPrice: maxPrice > 0 ? String(maxPrice) : "",
    sort,
  }

  const hasActiveFilters =
    Boolean(rawQ) || Boolean(city) || Boolean(type) || Boolean(purpose) ||
    minPrice > 0 || maxPrice > 0

  return (
    <>
      <section className="bg-ink-950 py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs font-bold text-white/50">
            <Link href={`/${locale}`} className="transition hover:text-white">
              {dict.nav.home}
            </Link>
            <ChevronRight className="size-3.5 rtl:hidden" />
            <ChevronLeft className="size-3.5 ltr:hidden" />
            <span className="text-gold-300">{dict.nav.properties}</span>
          </nav>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            {dict.nav.properties}
          </h1>
          <p className="mt-2 text-sm text-white/60">
            {list.length} {dict.common.results}
          </p>
        </div>
      </section>

      <section className="py-10 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PropertyFilters
            key={JSON.stringify(initial)}
            locale={locale}
            dict={dict}
            initial={initial}
          />

          {list.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((property) => (
                <PropertyCard
                  key={property.slug}
                  property={property}
                  locale={locale}
                  dict={dict}
                />
              ))}
            </div>
          ) : (
            <div className="mt-10 flex flex-col items-center rounded-3xl bg-white px-6 py-16 text-center ring-1 ring-slate-200/70">
              <span className="grid size-16 place-items-center rounded-full bg-sand-100 text-brand-600">
                <SearchX className="size-8" />
              </span>
              <h2 className="mt-5 text-xl font-extrabold text-ink-900">
                {dict.common.noResults}
              </h2>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                {dict.common.noResultsDesc}
              </p>
              {hasActiveFilters && (
                <Link
                  href={`/${locale}/properties`}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-700/20 transition hover:bg-brand-500"
                >
                  {dict.common.clearFilters}
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  )
}