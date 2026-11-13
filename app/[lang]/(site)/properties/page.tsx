import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { ListingsView, type ListingsFilters } from "@/components/listings-view"
import { RecentlyViewed } from "@/components/recently-viewed"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"
import { getProperties } from "@/lib/properties-store"

export const dynamic = "force-dynamic"

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
    keywords: locale === "ar"
      ? ["شقق للبيع إسطنبول", "فلل للبيع إسطنبول", "مكاتب إسطنبول", "أراضي إسطنبول", "إيجار شقق إسطنبول", "عقارات باشاكشهر", "عقارات كاياشهر", "عقارات بيليك دوزو", "عقارات إسطنبول"]
      : ["apartments for sale Istanbul", "villas for sale Istanbul", "offices Istanbul", "land for sale Istanbul", "rent apartment Istanbul", "real estate Basaksehir", "real estate Kayashehir", "real estate Beylikduzu", "Istanbul property listings"],
  }
}

/** Query values arrive as `string | string[]`; only the first one is useful. */
function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

export default async function PropertiesPage({
  params,
  searchParams,
}: PageProps) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const dict = await getDictionary(locale)
  const properties = await getProperties()

  const query = await searchParams
  const filters: ListingsFilters = {
    q: first(query.q),
    city: first(query.city),
    type: first(query.type),
    sort: first(query.sort),
    minPrice: first(query.minPrice),
    maxPrice: first(query.maxPrice),
    minBeds: first(query.minBeds),
    purpose: first(query.purpose),
    favorites: first(query.favorites),
    view: first(query.view),
  }

  return (
    <>
      <section className="relative overflow-hidden bg-ink-950 py-10 text-white lg:py-12">
        <div className="bg-grid-dark absolute inset-0 opacity-30" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <nav className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
            <Link href={`/${locale}`} className="transition hover:text-white">
              {dict.nav.home}
            </Link>
            <ChevronRight className="size-3 rtl:hidden" />
            <ChevronLeft className="size-3 ltr:hidden" />
            <span className="text-gold-300">{dict.nav.properties}</span>
          </nav>
          <h1 className="mt-3 font-heading text-2xl font-bold sm:text-3xl">
            {dict.nav.properties}
          </h1>
          <p className="mt-1.5 text-sm font-medium text-white/50">
            {properties.length} {dict.common.results}
          </p>
        </div>
      </section>

      <section className="py-10 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ListingsView
            locale={locale}
            dict={dict}
            allProperties={properties}
            filters={filters}
          />

          <RecentlyViewed
            properties={properties}
            locale={locale}
            dict={dict}
            className="mt-12"
          />

          {/* Tools that help a visitor decide — matcher, calculator, market data. */}
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <Link
              href={`/${locale}/match`}
              className="group rounded-2xl bg-white p-5 ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:ring-brand-300 hover:shadow-md"
            >
              <p className="font-heading text-sm font-bold text-ink-900 group-hover:text-brand-700">
                {locale === "ar" ? "لاقي عقارك" : "Find your match"}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {locale === "ar"
                  ? "ثلاثة أسئلة سريعة للوصول للعقار المناسب."
                  : "Three quick questions to reach the right property."}
              </p>
            </Link>
            <Link
              href={`/${locale}/calculator`}
              className="group rounded-2xl bg-white p-5 ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:ring-brand-300 hover:shadow-md"
            >
              <p className="font-heading text-sm font-bold text-ink-900 group-hover:text-brand-700">
                {locale === "ar" ? "حاسبة الاستثمار" : "Investment calculator"}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {locale === "ar"
                  ? "احسب العائد والدفعة الشهرية."
                  : "Work out yield and monthly payment."}
              </p>
            </Link>
            <Link
              href={`/${locale}/market`}
              className="group rounded-2xl bg-white p-5 ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:ring-brand-300 hover:shadow-md"
            >
              <p className="font-heading text-sm font-bold text-ink-900 group-hover:text-brand-700">
                {locale === "ar" ? "مؤشرات السوق" : "Market insights"}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {locale === "ar"
                  ? "متوسط الأسعار وسعر المتر حسب الحي."
                  : "Average prices and price per m² by district."}
              </p>
            </Link>
          </div>
        </div>
      </section>

      <section className="pb-16 lg:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 rounded-[2rem] bg-gradient-to-br from-brand-900 via-ink-900 to-ink-950 px-6 py-10 text-center text-white sm:flex-row sm:text-start sm:px-10">
            <div>
              <h2 className="text-2xl font-black">{dict.submit.title}</h2>
              <p className="mt-2 max-w-xl text-sm font-semibold leading-relaxed text-white/70">
                {dict.submit.subtitle}
              </p>
            </div>
            <Link
              href={`/${locale}/submit`}
              className="btn-gold inline-flex shrink-0 items-center gap-2 rounded-full px-7 py-3.5 text-sm font-extrabold"
            >
              <Plus className="size-4" />
              {dict.nav.submit}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}