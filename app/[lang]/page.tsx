import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowUpRight,
  Award,
  BadgeDollarSign,
  Briefcase,
  Building2,
  Crown,
  Headphones,
  Home as HomeIcon,
  House,
  Map,
  ShieldCheck,
} from "lucide-react"
import { PropertyCard } from "@/components/property-card"
import { SearchBox } from "@/components/search-box"
import type { PropertyTypeKey } from "@/lib/dictionaries/types"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"
import { properties } from "@/lib/properties"

const heroImage =
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2600&q=80"

const typeIcons: Record<PropertyTypeKey, typeof Building2> = {
  apartment: Building2,
  villa: HomeIcon,
  penthouse: Crown,
  townhouse: House,
  office: Briefcase,
  land: Map,
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const locale = hasLocale(lang) ? lang : "ar"
  const dict = await getDictionary(locale)
  return {
    title: dict.meta.homeTitle,
    description: dict.meta.homeDescription,
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const dict = await getDictionary(locale)

  const featured = properties.filter((property) => property.featured).slice(0, 6)

  const latest = [...properties]
    .sort(
      (a, b) =>
        new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
    )
    .slice(0, 3)

  const typeCounts = properties.reduce<Record<string, number>>((acc, p) => {
    acc[p.type] = (acc[p.type] ?? 0) + 1
    return acc
  }, {})

  const stats = [
    { value: "1,200+", label: dict.hero.statProperties },
    { value: "3,400+", label: dict.hero.statCustomers },
    { value: "12", label: dict.hero.statCities },
    { value: "15", label: dict.hero.statYears },
  ]

  const reasons = [
    { icon: ShieldCheck, title: dict.why.oneTitle, desc: dict.why.oneDesc },
    { icon: Award, title: dict.why.twoTitle, desc: dict.why.twoDesc },
    { icon: BadgeDollarSign, title: dict.why.threeTitle, desc: dict.why.threeDesc },
    { icon: Headphones, title: dict.why.fourTitle, desc: dict.why.fourDesc },
  ]

  return (
    <>
      {/* ============================== HERO ============================== */}
      <section className="relative overflow-hidden bg-ink-950">
        <Image
          src={heroImage}
          alt=""
          priority
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/85 via-ink-950/55 to-ink-950/90" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8 lg:py-32">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-gold-300 backdrop-blur">
            {dict.hero.badge}
          </span>

          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            {dict.hero.title1}{" "}
            <span className="text-gold-400">{dict.hero.titleHighlight}</span>{" "}
            {dict.hero.title2}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-white/75 sm:text-lg">
            {dict.hero.subtitle}
          </p>

          <SearchBox locale={locale} dict={dict} />
        </div>
      </section>

      {/* ============================== STATS ============================== */}
      <section className="bg-brand-900 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-black text-gold-400 lg:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm font-semibold text-white/70">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================== FEATURED ========================== */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-ink-900 sm:text-3xl">
                {dict.sections.featuredTitle}
              </h2>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                {dict.sections.featuredSubtitle}
              </p>
            </div>
            <Link
              href={`/${locale}/properties`}
              className="group inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-brand-700/20 transition hover:bg-brand-500"
            >
              {dict.common.viewAll}
              <ArrowUpRight className="size-4 rtl:-scale-x-100" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((property) => (
              <PropertyCard
                key={property.slug}
                property={property}
                locale={locale}
                dict={dict}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ========================== BROWSE BY TYPE ========================== */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-black text-ink-900 sm:text-3xl">
              {dict.sections.browseTitle}
            </h2>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              {dict.sections.browseSubtitle}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(dict.propertyTypes) as PropertyTypeKey[]).map(
              (key) => {
                const Icon = typeIcons[key]
                const count = typeCounts[key] ?? 0
                return (
                  <Link
                    key={key}
                    href={`/${locale}/properties?type=${key}`}
                    className="group rounded-3xl border border-slate-200/80 bg-sand-50 p-6 transition hover:-translate-y-1 hover:border-brand-300 hover:bg-white hover:shadow-xl"
                  >
                    <div className="flex items-start justify-between">
                      <span className="grid size-12 place-items-center rounded-2xl bg-brand-100 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
                        <Icon className="size-6" />
                      </span>
                      <ArrowUpRight className="size-5 text-slate-300 transition group-hover:text-brand-600 rtl:-scale-x-100" />
                    </div>
                    <h3 className="mt-5 text-lg font-extrabold text-ink-900">
                      {dict.propertyTypes[key]}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {dict.propertyTypeDescriptions[key]}
                    </p>
                    <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-brand-700">
                      <span>
                        {count} {dict.common.properties}
                      </span>
                      <span className="h-px w-5 bg-brand-300 transition group-hover:bg-brand-600" />
                    </p>
                  </Link>
                )
              },
            )}
          </div>
        </div>
      </section>

      {/* ========================== WHY US ========================== */}
      <section className="bg-ink-950 py-16 text-white lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-black sm:text-3xl">
              {dict.sections.whyTitle}
            </h2>
            <p className="mt-2 text-sm text-white/60 sm:text-base">
              {dict.sections.whySubtitle}
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-gold-400/40 hover:bg-white/[0.08]"
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-gold-400/15 text-gold-400">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-5 text-lg font-extrabold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================== LATEST ========================== */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-ink-900 sm:text-3xl">
                {dict.sections.latestTitle}
              </h2>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                {dict.sections.latestSubtitle}
              </p>
            </div>
            <Link
              href={`/${locale}/properties`}
              className="group inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-extrabold text-ink-900 transition hover:border-brand-600 hover:bg-brand-50"
            >
              {dict.common.viewAll}
              <ArrowUpRight className="size-4 text-brand-600 rtl:-scale-x-100" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((property) => (
              <PropertyCard
                key={property.slug}
                property={property}
                locale={locale}
                dict={dict}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ========================== CTA ========================== */}
      <section className="pb-16 lg:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-800 via-brand-900 to-ink-950 px-6 py-14 text-center text-white sm:px-12">
            <div className="absolute -end-24 -top-24 size-72 rounded-full bg-gold-400/15 blur-3xl" />
            <div className="absolute -bottom-28 -start-20 size-72 rounded-full bg-brand-400/20 blur-3xl" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-2xl font-black sm:text-3xl">
                {dict.sections.ctaTitle}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-white/70 sm:text-base">
                {dict.sections.ctaSubtitle}
              </p>
              <a
                href="mailto:hello@arakan-estate.com"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold-500 px-7 py-3.5 text-sm font-extrabold text-ink-950 shadow-xl shadow-gold-600/25 transition hover:bg-gold-400"
              >
                {dict.sections.ctaButton}
                <ArrowUpRight className="size-4 rtl:-scale-x-100" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}