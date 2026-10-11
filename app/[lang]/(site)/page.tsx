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
} from "lucide-react"
import { PropertyCard } from "@/components/property-card"
import { SearchBox } from "@/components/search-box"
import { Reveal } from "@/components/reveal"
import { Counter } from "@/components/counter"
import type { PropertyTypeKey } from "@/lib/dictionaries/types"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"
import { getProperties } from "@/lib/properties-store"
import { turnstileSiteKey } from "@/lib/turnstile"

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

/* Color palette — elevated real estate theme */
const bgGrad = "bg-gradient-to-br from-ink-950 via-ink-900 to-brand-900"
const textPrimary = "text-ink-950"
const textSecondary = "text-slate-400"
const cardBg = "bg-white"
const borderColor = "border-slate-200/70"
const goldAccent = "text-gold-400 ring-gold-500/30"

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

  const latest = byNewest.slice(0, 3)

  const typeCounts = properties.reduce<Record<string, number>>((acc, p) => {
    acc[p.type] = (acc[p.type] ?? 0) + 1
    return acc
  }, {})

  const stats = [
    { value: properties.length, suffix: "", label: dict.hero.statProperties },
    { value: 12, suffix: "", label: dict.hero.statCities },
    { value: 5, suffix: "", label: dict.hero.statYears },
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
      <section className="relative overflow-hidden min-h-[600px] flex items-center justify-center px-4 sm:px-6 lg:px-8 lg:py-32 bg-gradient-to-br from-ink-950 via-ink-900 to-brand-900">
        <div className="pointer-events-none absolute -top-24 end-[-8rem] size-96 rounded-full bg-gold-400/10 blur-3xl lg:top-32 lg:-end-8rem" />
        <div className="pointer-events-none absolute -bottom-32 start-[-6rem] size-96 rounded-full bg-brand-500/20 blur-3xl lg:bottom-48 lg:-start-6rem" />
        <div className="relative mx-auto max-w-7xl w-full">
          <div className="px-4 sm:px-6 lg:px-8 text-center sm:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-xs font-extrabold text-gold-300">
              <Sparkles className="size-3.5" />
              {dict.submit.badge}
            </span>
            <h1 className="mt-8 text-4xl font-black leading-tight sm:text-5xl md:text-6xl lg:text-7xl text-white">
              {dict.submit.title}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg font-semibold leading-relaxed text-white/70 sm:text-base lg:text-xl">
              {dict.submit.subtitle}
            </p>
            <div className="mt-10 sm:mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Link
                href={`/${locale}/properties?purpose=sale`}
                className="btn-brand-col sm:col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-extrabold text-white transition hover:brightness-105"
              >
                <BadgeCheck className="size-3.5" />
                {dict.common.forSale}
              </Link>
              <Link
                href={`/${locale}/properties?purpose=rent`}
                className="btn-gold-col sm:col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-extrabold text-ink-950 transition hover:brightness-105"
              >
                <Send className="size-3.5" />
                {dict.common.forRent}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================== STATS ============================== */}
      <section className="relative overflow-hidden bg-ink-950 py-4 text-white">
        <div className="absolute inset-0 bg-grid-dark opacity-30" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="relative rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-5 text-center backdrop-blur-sm transition hover:border-gold-400/30 hover:bg-white/[0.08]"
            >
              <p className="text-3xl font-black text-gradient-gold lg:text-4xl">
                <Counter to={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-1.5 text-sm font-bold text-white/60">
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
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-brand-700 ring-1 ring-brand-100">
                {dict.common.properties}
              </span>
              <h2 className="mt-3 text-2xl font-black text-ink-900 sm:text-3xl">
                {dict.sections.featuredTitle}
              </h2>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                {dict.sections.featuredSubtitle}
              </p>
            </div>
            <Link
              href={`/${locale}/properties`}
              className="btn-brand inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-extrabold text-white"
            >
              {dict.common.viewAll}
              <ArrowUpRight className="size-4 rtl:-scale-x-100" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* ========================== BROWSE BY TYPE ========================== */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/15 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-gold-600 ring-1 ring-gold-500/25">
              {dict.sections.browseTitle}
            </span>
            <h2 className="mt-3 text-2xl font-black text-ink-900 sm:text-3xl">
              {dict.sections.browseTitle}
            </h2>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              {dict.sections.browseSubtitle}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(dict.propertyTypes) as PropertyTypeKey[]).map(
              (key, index) => {
                const Icon = typeIcons[key]
                const count = typeCounts[key] ?? 0
                return (
                  <Reveal key={key} delay={index * 0.05}>
                    <Link
                      href={`/${locale}/properties?type=${key}`}
                      className="card-raised group relative flex items-center gap-5 overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white to-sand-50 p-6"
                    >
                      <span className="pointer-events-none absolute -end-10 -top-10 size-32 rounded-full bg-gold-400/10 blur-2xl transition duration-500 group-hover:bg-gold-400/20" />
                      <span className="relative grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-800 text-white shadow-lg shadow-brand-800/25 ring-1 ring-white/30 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                        <Icon className="size-6" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-extrabold text-ink-900">
                          {dict.propertyTypes[key]}
                        </h3>
                        <p className="mt-0.5 truncate text-sm text-slate-500">
                          {dict.propertyTypeDescriptions[key]}
                        </p>
                        <p className="mt-2 text-[13px] font-extrabold uppercase tracking-wider text-brand-700">
                          {count} {dict.common.properties}
                        </p>
                      </div>
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-slate-400 ring-1 ring-slate-200 transition-all duration-300 group-hover:bg-gold-500 group-hover:text-white group-hover:ring-gold-500">
                        <ArrowUpRight className="size-4 rtl:-scale-x-100" />
                      </span>
                    </Link>
                  </Reveal>
                )
              },
            )}
          </div>
        </div>
      </section>

      {/* ========================== LATEST ========================== */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-brand-700 ring-1 ring-brand-100">
                {dict.sections.latestTitle}
              </span>
              <h2 className="mt-3 text-2xl font-black text-ink-900 sm:text-3xl">
                {dict.sections.latestTitle}
              </h2>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">
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

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* ========================== WHY US ========================== */}
      <section className="bg-ink-950 py-16 text-white lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/20 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-gold-300 ring-1 ring-gold-500/30">
              {dict.sections.whyTitle}
            </span>
            <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">
              {dict.sections.whyTitle}
            </h2>
            <p className="mt-2 text-sm text-white/60 sm:text-base">
              {dict.sections.whySubtitle}
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map(({ icon: Icon, title, desc }, index) => (
              <Reveal key={title} delay={index * 0.06}>
                <div className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition duration-300 hover:border-gold-400/40 hover:bg-white/[0.08]">
                  <span className="pointer-events-none absolute -end-12 -top-12 size-28 rounded-full bg-gold-400/10 blur-2xl" />
                  <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-gold-400/30 to-gold-600/20 text-gold-300 ring-1 ring-gold-400/25 transition group-hover:from-gold-400 group-hover:to-gold-600 group-hover:text-ink-950">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-extrabold text-white">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    {desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========================== CTA ========================== */}
      <section className="relative overflow-hidden py-6 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grain relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-900 via-ink-900 to-ink-950 px-6 py-16 text-center text-white sm:px-12 lg:py-20">
            <div className="bg-grid-dark absolute inset-0 opacity-40" />
            <div className="absolute -end-28 -top-28 size-80 rounded-full bg-gold-400/20 blur-3xl" />
            <div className="absolute -bottom-32 -start-24 size-80 rounded-full bg-brand-400/20 blur-3xl" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-gold-300 backdrop-blur">
                <Sparkles className="size-3.5" />
                {dict.sections.ctaTitle}
              </span>
              <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-black leading-tight sm:text-4xl">
                {dict.sections.ctaTitle}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
                {dict.sections.ctaSubtitle}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={`/${locale}/submit`}
                  className="btn-brand inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-extrabold text-white"
                >
                  <Plus className="size-4" />
                  {dict.nav.submit}
                </Link>
                <a
                  href="mailto:Iskanrealestatetr@gmail.com"
                  className="btn-gold inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-extrabold"
                >
                  {dict.sections.ctaButton}
                  <ArrowUpRight className="size-4 rtl:-scale-x-100" />
                </a>
                <a
                  href="https://wa.me/905432466309"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-8 py-3.5 text-sm font-extrabold text-white backdrop-blur transition hover:bg-white/20"
                >
                  <MessageCircle className="size-4 text-gold-300" />
                  {dict.common.whatsapp}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}