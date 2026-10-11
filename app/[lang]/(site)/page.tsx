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
  MessageCircle,
  Plus,
  ShieldCheck,
  Sparkles,
  Send,
  BadgeCheck,
  Search,
  Filter,
  Heart,
  MapPin,
  Star,
  Users,
  Building,
} from "lucide-react"
import { PropertyCard } from "@/components/property-card"
import { SearchBox } from "@/components/search-box"
import { Reveal } from "@/components/reveal"
import { Counter } from "@/components/counter"
import type { PropertyTypeKey } from "@/lib/dictionaries/types"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"
import { getProperties } from "@/lib/properties-store"

export const dynamic = "force-dynamic"

const heroImage =
  "https://images.unsplash.com/photo-1772436938086-0b3224b69483?auto=format&fit=crop&w=2600&q=80"

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
      {/* ============================== HERO WITH SEARCH ============================== */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-ink-950/95 via-ink-900/90 to-brand-900/95" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          {/* Top Bar - Logo & Navigation */}
          <div className="mb-12 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                <HomeIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-white">ISKAN</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-white/80 text-sm font-medium">
              <Link href={`/${locale}/properties`} className="hover:text-gold-400 transition">{dict.nav.properties}</Link>
              <Link href={`/${locale}/submit`} className="hover:text-gold-400 transition">{dict.nav.submit}</Link>
              <a href="https://wa.me/905432466309" target="_blank" rel="noopener noreferrer" className="hover:text-gold-400 transition flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {dict.common.whatsapp}
              </a>
            </div>
          </div>

          {/* Main Hero Content */}
          <div className="text-center sm:text-left max-w-4xl mx-auto">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-2 text-xs font-extrabold uppercase tracking-widest text-gold-300 backdrop-blur ring-1 ring-gold-400/30">
              <Sparkles className="size-3.5" />
              {dict.submit.badge}
            </span>

            <h1 className="mt-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight text-white">
              {dict.submit.title}
              <br />
              <span className="text-gradient-gold text-shimmer">{dict.hero.titleHighlight}</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl leading-relaxed">
              {dict.submit.subtitle}
            </p>

            {/* Search Box */}
            <div className="mt-10">
              <SearchBox locale={locale} dict={dict} />
            </div>

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-gold-400/30 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gold-400/20 flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-gold-400" />
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-black text-white">
                        <Counter to={stat.value} suffix={stat.suffix} />
                      </p>
                      <p className="text-xs font-medium text-white/60">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
              <Link
                href={`/${locale}/properties?purpose=sale`}
                className="btn-brand inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-extrabold text-white transition hover:brightness-105 w-full sm:w-auto"
              >
                <BadgeCheck className="size-4" />
                {dict.common.forSale}
              </Link>
              <Link
                href={`/${locale}/properties?purpose=rent`}
                className="btn-gold inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-extrabold text-ink-950 transition hover:brightness-105 w-full sm:w-auto"
              >
                <Send className="size-4" />
                {dict.common.forRent}
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ============================== CATEGORIES ============================== */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-brand-700 ring-1 ring-brand-100">
              {dict.sections.browseTitle}
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black text-ink-900">
              {dict.sections.browseTitle}
            </h2>
            <p className="mt-2 text-lg text-slate-500 max-w-2xl mx-auto">
              {dict.sections.browseSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {(Object.keys(dict.propertyTypes) as PropertyTypeKey[]).map((key, index) => {
              const Icon = typeIcons[key]
              const count = typeCounts[key] ?? 0
              return (
                <Reveal key={key} delay={index * 0.05}>
                  <Link
                    href={`/${locale}/properties?type=${key}`}
                    className="group relative flex flex-col items-center gap-3 p-6 rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white to-slate-50/50 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-400/10 transition-all duration-300"
                  >
                    <span className="pointer-events-none absolute -top-4 -end-4 size-20 rounded-full bg-gold-400/10 blur-2xl transition duration-500 group-hover:bg-gold-400/20" />
                    <span className="relative grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-800 text-white shadow-lg shadow-brand-800/25 ring-1 ring-white/30 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                      <Icon className="size-7" />
                    </span>
                    <div className="text-center">
                      <h3 className="text-lg font-extrabold text-ink-900 group-hover:text-brand-700 transition">
                        {dict.propertyTypes[key]}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {dict.propertyTypeDescriptions[key]}
                      </p>
                      <p className="mt-2 text-[13px] font-extrabold uppercase tracking-wider text-brand-700">
                        {count} {dict.common.properties}
                      </p>
                    </div>
                    <span className="absolute bottom-4 right-4 grid size-10 place-items-center rounded-full bg-white text-slate-400 ring-1 ring-slate-200 transition-all duration-300 group-hover:bg-gold-500 group-hover:text-white group-hover:ring-gold-500">
                      <ArrowUpRight className="size-4 rtl:-scale-x-100" />
                    </span>
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ========================== FEATURED PROPERTIES ========================== */}
      <section className="py-20 bg-sand-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-brand-700 ring-1 ring-brand-100">
                {dict.sections.featuredTitle}
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black text-ink-900">
                {dict.sections.featuredTitle}
              </h2>
              <p className="mt-2 text-lg text-slate-500">
                {dict.sections.featuredSubtitle}
              </p>
            </div>
            <Link
              href={`/${locale}/properties`}
              className="btn-brand inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-extrabold text-white transition hover:brightness-105"
            >
              {dict.common.viewAll}
              <ArrowUpRight className="size-4 rtl:-scale-x-100" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((property, index) => (
              <Reveal key={property.slug} delay={index * 0.06} className="h-full">
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

      {/* ========================== LATEST LISTINGS ========================== */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-brand-700 ring-1 ring-brand-100">
                {dict.sections.latestTitle}
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black text-ink-900">
                {dict.sections.latestTitle}
              </h2>
              <p className="mt-2 text-lg text-slate-500">
                {dict.sections.latestSubtitle}
              </p>
            </div>
            <Link
              href={`/${locale}/properties`}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-extrabold text-ink-900 transition duration-300 hover:border-gold-400 hover:bg-gold-400/10 hover:shadow-lg hover:shadow-gold-400/10"
            >
              {dict.common.viewAll}
              <ArrowUpRight className="size-4 text-brand-600 rtl:-scale-x-100" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latest.map((property, index) => (
              <Reveal key={property.slug} delay={index * 0.06} className="h-full">
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

      {/* ========================== TRUST SIGNALS ========================== */}
      <section className="py-20 bg-ink-950 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/20 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-gold-300 ring-1 ring-gold-500/30">
              {dict.sections.whyTitle}
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black">
              {dict.sections.whyTitle}
            </h2>
            <p className="mt-3 text-lg text-white/60 max-w-2xl mx-auto">
              {dict.sections.whySubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {reasons.map(({ icon: Icon, title, desc }, index) => (
              <Reveal key={title} delay={index * 0.06}>
                <div className="group relative h-full p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur transition duration-300 hover:border-gold-400/40 hover:bg-white/[0.06] hover:shadow-xl hover:shadow-gold-400/10">
                  <span className="pointer-events-none absolute -end-12 -top-12 size-28 rounded-full bg-gold-400/10 blur-2xl" />
                  <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-gold-400/30 to-gold-600/20 text-gold-300 ring-1 ring-gold-400/25 transition group-hover:from-gold-400 group-hover:to-gold-600 group-hover:text-ink-950">
                    <Icon className="size-7" />
                  </span>
                  <h3 className="mt-6 text-xl font-extrabold text-white">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">
                    {desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========================== CTA SECTION ========================== */}
      <section className="relative overflow-hidden py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grain relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-900 via-ink-900 to-ink-950 px-6 py-16 text-center text-white sm:px-12 lg:py-24 lg:px-20">
            <div className="bg-grid-dark absolute inset-0 opacity-40" />
            <div className="absolute -end-28 -top-28 size-80 rounded-full bg-gold-400/20 blur-3xl" />
            <div className="absolute -bottom-32 -start-24 size-80 rounded-full bg-brand-400/20 blur-3xl" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-gold-300 backdrop-blur">
                <Sparkles className="size-3.5" />
                {dict.sections.ctaTitle}
              </span>
              <h2 className="mx-auto mt-5 max-w-2xl text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
                {dict.sections.ctaTitle}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/70">
                {dict.sections.ctaSubtitle}
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href={`/${locale}/submit`}
                  className="btn-brand inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-extrabold text-white w-full sm:w-auto"
                >
                  <Plus className="size-4" />
                  {dict.nav.submit}
                </Link>
                <a
                  href="mailto:Iskanrealestatetr@gmail.com"
                  className="btn-gold inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-extrabold w-full sm:w-auto"
                >
                  {dict.sections.ctaButton}
                  <ArrowUpRight className="size-4 rtl:-scale-x-100" />
                </a>
                <a
                  href="https://wa.me/905432466309"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-8 py-4 text-sm font-extrabold text-white backdrop-blur transition hover:bg-white/20 w-full sm:w-auto"
                >
                  <MessageCircle className="size-4 text-gold-300" />
                  {dict.common.whatsapp}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================== FOOTER CTA ========================== */}
      <section className="py-16 bg-sand-50 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl sm:text-3xl font-black text-ink-900">
            {dict.sections.ctaTitle}
          </h3>
          <p className="mt-3 text-lg text-slate-500 max-w-2xl mx-auto">
            {dict.sections.ctaSubtitle}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${locale}/submit`}
              className="btn-brand inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-extrabold text-white transition hover:brightness-105 w-full sm:w-auto"
            >
              <Plus className="size-4" />
              {dict.nav.submit}
            </Link>
            <a
              href="https://wa.me/905432466309"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-emerald-500 bg-emerald-50 px-8 py-4 text-sm font-extrabold text-emerald-700 transition hover:bg-emerald-500 hover:text-white w-full sm:w-auto"
            >
              <MessageCircle className="size-4" />
              {dict.common.whatsapp}
            </a>
          </div>
        </div>
      </section>
    </>
  )
}