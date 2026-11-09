import Link from "next/link"
import type { ReactNode } from "react"
import { notFound } from "next/navigation"
import {
  ArrowUpRight,
  Award,
  BadgeDollarSign,
  Briefcase,
  Building2,
  Headphones,
  Home as HomeIcon,
  Hotel,
  Map,
  MapPin,
  Plus,
  Send,
  ShieldCheck,
  Users,
  Building,
} from "lucide-react"
import { PropertyCard } from "@/components/property-card"
import { SearchBox } from "@/components/search-box"
import { Reveal } from "@/components/reveal"
import { HeroParallax } from "@/components/hero-parallax"
import { Counter } from "@/components/counter"
import type { PropertyTypeKey } from "@/lib/dictionaries/types"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"
import { getProperties } from "@/lib/properties-store"
import { WhatsAppIcon } from "@/components/whatsapp-icon"

export const dynamic = "force-dynamic"

const heroImage =
  "https://images.unsplash.com/photo-1772436938086-0b3224b69483?auto=format&fit=crop&w=2600&q=80"

const typeIcons: Record<PropertyTypeKey, typeof Building2> = {
  apartment: Building2,
  villa: HomeIcon,
  office: Briefcase,
  land: Map,
  tourist_apartment: Hotel,
}

function SectionHead({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-2xl">
        <span className="block h-px w-7 bg-gold-500" />
        <h2 className="mt-4 font-heading text-2xl font-bold leading-tight text-ink-900 sm:text-[2rem]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-[15px] leading-7 text-slate-500">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  )
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
  const properties = await getProperties()

  const byNewest = [...properties].sort(
    (a, b) =>
      new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
  )

  const featured = properties.some((property) => property.featured)
    ? properties.filter((property) => property.featured).slice(0, 6)
    : byNewest.slice(0, 6)

  const latest = byNewest.slice(0, 6)

  const typeCounts = properties.reduce<Record<string, number>>((acc, p) => {
    acc[p.type] = (acc[p.type] ?? 0) + 1
    return acc
  }, {})

  const stats = [
    { value: properties.length, suffix: "", label: dict.hero.statProperties, icon: Building },
    { value: 12, suffix: "", label: dict.hero.statCities, icon: MapPin },
    { value: 5, suffix: "", label: dict.hero.statYears, icon: Award },
    { value: 5000, suffix: "+", label: dict.hero.statCustomers, icon: Users },
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
      <section className="relative overflow-hidden bg-ink-950 text-white">
        <HeroParallax src={heroImage} alt="" />
        <div className="absolute inset-0 bg-gradient-to-br from-ink-950/95 via-ink-950/85 to-brand-900/85" />
        {/* Subtle grain overlay for texture */}
        <div className="grain absolute inset-0" />

        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-gold-300">
            <span className="h-px w-7 bg-gold-400/70" />
            {dict.hero.badge}
          </span>

          <h1 className="mt-5 max-w-3xl font-heading text-[2rem] font-bold leading-[1.12] sm:text-5xl lg:text-[3.4rem]">
            {dict.hero.title1}{" "}
            <span className="text-gradient-gold">{dict.hero.titleHighlight}</span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
            {dict.hero.subtitle}
          </p>

          <div className="mt-9">
            <SearchBox locale={locale} dict={dict} />
          </div>

          {/* Quick stats */}
          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-5">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-heading text-2xl font-bold text-white sm:text-[1.75rem]">
                  <Counter to={stat.value} suffix={stat.suffix} />
                </dd>
                <dd className="mt-1 flex items-center gap-1.5 text-xs font-medium text-white/55">
                  <stat.icon className="size-3.5 text-gold-400" />
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-10">
            <Link
              href={`/${locale}/properties?purpose=rent`}
              className="btn-gold inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold"
            >
              <Send className="size-4" />
              {dict.common.forRent}
            </Link>
          </div>
        </div>
      </section>

      {/* ============================== CATEGORIES ============================== */}
      <section className="bg-white py-14 lg:py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <SectionHead
            title={dict.sections.browseTitle}
            subtitle={dict.sections.browseSubtitle}
          />

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {(Object.keys(dict.propertyTypes) as PropertyTypeKey[]).map((key, index) => {
              const Icon = typeIcons[key]
              const count = typeCounts[key] ?? 0
              return (
                <Reveal key={key} delay={index * 0.04} className="h-full">
                  <Link
                    href={`/${locale}/properties?type=${key}`}
                    className="group relative flex h-full items-center gap-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 transition duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-900/5"
                  >
                    {/* A hairline that draws in from the start edge on hover:
                        cheap, and it makes the whole tile feel responsive. */}
                    <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-brand-600 to-gold-400 transition-transform duration-300 group-hover:scale-x-100 rtl:origin-right" />

                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-50 to-sand-100 text-brand-700 ring-1 ring-brand-100 transition duration-300 group-hover:from-brand-600 group-hover:to-brand-800 group-hover:text-white group-hover:ring-brand-600">
                      <Icon className="size-5" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-heading text-base font-bold text-ink-900 transition group-hover:text-brand-700">
                        {dict.propertyTypes[key]}
                      </h3>
                      <p className="mt-0.5 text-xs font-medium text-slate-400">
                        {count} {dict.common.properties}
                      </p>
                    </div>

                    <ArrowUpRight className="size-4 shrink-0 text-slate-300 transition duration-300 group-hover:-translate-y-0.5 group-hover:text-brand-600 rtl:-scale-x-100" />
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ========================== FEATURED ========================== */}
      <section className="bg-sand-50 py-14 lg:py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <SectionHead
            title={dict.sections.featuredTitle}
            subtitle={dict.sections.featuredSubtitle}
          >
            <Link
              href={`/${locale}/properties`}
              className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-ink-800"
            >
              {dict.common.viewAll}
              <ArrowUpRight className="size-4 rtl:-scale-x-100" />
            </Link>
          </SectionHead>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featured.map((property, index) => (
              <Reveal key={property.slug} delay={index * 0.05} className="h-full">
                <PropertyCard
                  property={property}
                  locale={locale}
                  dict={dict}
                  className="h-full"
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========================== LATEST ========================== */}
      <section className="bg-white py-14 lg:py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <SectionHead
            title={dict.sections.latestTitle}
            subtitle={dict.sections.latestSubtitle}
          >
            <Link
              href={`/${locale}/properties`}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-bold text-ink-900 transition hover:border-brand-400 hover:text-brand-700"
            >
              {dict.common.viewAll}
              <ArrowUpRight className="size-4 text-brand-600 rtl:-scale-x-100" />
            </Link>
          </SectionHead>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {latest.map((property, index) => (
              <Reveal key={property.slug} delay={index * 0.05} className="h-full">
                <PropertyCard
                  property={property}
                  locale={locale}
                  dict={dict}
                  className="h-full"
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========================== TRUST ========================== */}
      <section className="bg-ink-950 py-14 text-white lg:py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <span className="block h-px w-7 bg-gold-500" />
            <h2 className="mt-4 font-heading text-2xl font-bold leading-tight sm:text-[2rem]">
              {dict.sections.whyTitle}
            </h2>
            <p className="mt-2 text-[15px] leading-7 text-white/60">
              {dict.sections.whySubtitle}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map(({ icon: Icon, title, desc }, index) => (
              <Reveal key={title} delay={index * 0.05}>
                <div className="border-t border-white/10 pt-6">
                  <span className="grid size-11 place-items-center rounded-xl bg-gold-400/10 text-gold-300">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-5 font-heading text-lg font-bold text-white">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-white/55">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========================== CTA ========================== */}
      <section className="bg-white py-14 lg:py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-ink-900 to-ink-950 px-6 py-12 text-white sm:px-12 sm:py-16">
            <div className="bg-grid-dark absolute inset-0 opacity-25" />
            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="font-heading text-2xl font-bold leading-tight sm:text-[2rem]">
                {dict.sections.ctaTitle}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-[15px] leading-7 text-white/65">
                {dict.sections.ctaSubtitle}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href={`/${locale}/submit`}
                  className="btn-gold inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold sm:w-auto"
                >
                  <Plus className="size-4" />
                  {dict.nav.submit}
                </Link>
                <a
                  href="https://wa.me/905432466309"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20 sm:w-auto"
                >
                  <WhatsAppIcon className="size-4 text-gold-300" />
                  {dict.common.whatsapp}
                </a>
                <a
                  href={`mailto:Iskanrealestatetr@gmail.com`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-bold text-white/90 transition hover:bg-white/10 sm:w-auto"
                >
                  {dict.sections.ctaButton}
                  <ArrowUpRight className="size-4 rtl:-scale-x-100" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
