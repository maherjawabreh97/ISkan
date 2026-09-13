import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import {
  ArrowUpRight,
  Bath,
  BedDouble,
  CalendarDays,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Layers,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
} from "lucide-react"
import { PropertyGallery } from "@/components/property-gallery"
import { StickyActions } from "@/components/sticky-actions"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"
import { formatPrice } from "@/lib/format"
import { getProperty, properties } from "@/lib/properties"

type PageProps = {
  params: Promise<{ lang: string; slug: string }>
}

export function generateStaticParams() {
  return properties.map((property) => ({ slug: property.slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { lang, slug } = await params
  const locale = hasLocale(lang) ? lang : "ar"
  const property = getProperty(slug)
  const dict = await getDictionary(locale)
  return {
    title: property ? `${property.name[locale]} — ${dict.brand.name}` : dict.meta.propertiesTitle,
  }
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { lang, slug } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const dict = await getDictionary(locale)

  const property = getProperty(slug)
  if (!property) notFound()

  const name = property.name[locale]
  const city = dict.cities[property.city]
  const purposeLabel =
    property.purpose === "rent" ? dict.common.forRent : dict.common.forSale
  const purposeBadge =
    property.purpose === "rent" ? "bg-brand-600 text-white" : "bg-gold-500 text-ink-950"
  const perMonth = property.pricePerMonth ? ` ${dict.common.perMonth}` : ""

  type Feature = {
    icon: typeof BedDouble
    label: string
    value: string
  }

  const features: Feature[] = [
    property.bedrooms > 0 && {
      icon: BedDouble,
      label: dict.common.beds,
      value: `${property.bedrooms}`,
    },
    property.bathrooms > 0 && {
      icon: Bath,
      label: dict.common.baths,
      value: `${property.bathrooms}`,
    },
    {
      icon: Ruler,
      label: dict.common.area,
      value: `${property.area} ${dict.common.sqm}`,
    },
    property.parking > 0 && {
      icon: Car,
      label: dict.common.parking,
      value: `${property.parking}`,
    },
    property.yearBuilt > 0 && {
      icon: CalendarDays,
      label: dict.common.yearBuilt,
      value: `${property.yearBuilt}`,
    },
    property.floor !== undefined && {
      icon: Layers,
      label: dict.common.floor,
      value: `${property.floor}`,
    },
  ].filter((item): item is Feature => Boolean(item))

  const whatsappHref = `https://wa.me/905432466309?text=${encodeURIComponent(
    `Hello Iskan! I'm interested in: ${name}, ${property.address[locale]}`,
  )}`

  const related = [
    ...properties.filter(
      (p) =>
        p.slug !== slug &&
        (p.city === property.city || p.type === property.type),
    ),
    ...properties.filter(
      (p) => p.slug !== slug && p.city !== property.city && p.type !== property.type,
    ),
  ].slice(0, 3)

  return (
    <>
      <section className="bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-400">
            <Link href={`/${locale}`} className="transition hover:text-brand-700">
              {dict.nav.home}
            </Link>
            <ChevronRight className="size-3.5 rtl:hidden" />
            <ChevronLeft className="size-3.5 ltr:hidden" />
            <Link
              href={`/${locale}/properties`}
              className="transition hover:text-brand-700"
            >
              {dict.nav.properties}
            </Link>
            <ChevronRight className="size-3.5 rtl:hidden" />
            <ChevronLeft className="size-3.5 ltr:hidden" />
            <span className="text-brand-700">{name}</span>
          </nav>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wider ${purposeBadge}`}
                >
                  {purposeLabel}
                </span>
                <span className="text-sm font-bold text-slate-500">
                  {dict.propertyTypes[property.type]}
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-black text-ink-900 sm:text-4xl">
                {name}
              </h1>
              <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-slate-500">
                <MapPin className="size-4 text-brand-600" />
                {property.address[locale]}
                <span className="text-slate-400">—</span>
                <span>{city}</span>
              </p>
            </div>
            <div className="text-end">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {dict.common.price}
              </p>
              <p className="mt-1 text-3xl font-black text-brand-700">
                {formatPrice(property.price)}
                <span className="text-base font-bold text-slate-500">{perMonth}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <div className="space-y-10">
              <PropertyGallery
                images={property.images}
                slug={property.slug}
                name={name}
                locale={locale}
              />

              {/* Features */}
              <div>
                <h2 className="text-xl font-extrabold text-ink-900">
                  {dict.common.features}
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {features.map((feature) => (
                    <div
                      key={feature.label}
                      className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200/70"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700">
                        <feature.icon className="size-5" />
                      </span>
                      <div className="leading-tight">
                        <p className="text-xs font-bold text-slate-400">
                          {feature.label}
                        </p>
                        <p className="text-base font-extrabold text-ink-900">
                          {feature.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-extrabold text-ink-900">
                  {dict.common.description}
                </h2>
                <p className="mt-4 max-w-3xl text-[15px] leading-8 text-slate-600">
                  {property.description[locale]}
                </p>
              </div>

              {/* Amenities */}
              <div>
                <h2 className="text-xl font-extrabold text-ink-900">
                  {dict.common.amenities}
                </h2>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {property.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-2 text-sm font-bold text-brand-800 ring-1 ring-brand-100"
                    >
                      <Check className="size-4 text-brand-600" />
                      {dict.amenities[amenity]}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Agent / contact card */}
            <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
              <div className="relative overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-slate-200/70 shadow-soft">
                <span className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-gold-400 to-brand-500" />
                <div className="flex items-center gap-4">
                  <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-black text-white shadow-lg">
                    {property.agent.name[locale].charAt(0)}
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {dict.common.agent}
                    </p>
                    <p className="text-lg font-extrabold text-ink-900">
                      {property.agent.name[locale]}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-5 text-sm">
                  <a
                    href={`tel:${property.agent.phone}`}
                    className="flex items-center gap-3 rounded-xl bg-sand-50 px-4 py-3 font-bold text-ink-900 ring-1 ring-slate-200/70 transition hover:ring-brand-400"
                  >
                    <Phone className="size-4 text-brand-600" />
                    <span dir="ltr">{property.agent.phone}</span>
                  </a>
                  <a
                    href={`mailto:${property.agent.email}`}
                    className="flex items-center gap-3 rounded-xl bg-sand-50 px-4 py-3 font-bold text-ink-900 ring-1 ring-slate-200/70 transition hover:ring-brand-400"
                  >
                    <Mail className="size-4 text-brand-600" />
                    <span>{property.agent.email}</span>
                  </a>
                </div>

                <div className="mt-5 grid gap-3">
                  <a
                    href={`tel:${property.agent.phone}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-700/20 transition hover:bg-brand-500"
                  >
                    <Phone className="size-4" />
                    {dict.common.callNow}
                  </a>
                  <a
                    href={`mailto:${property.agent.email}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-extrabold text-ink-900 transition hover:border-brand-400 hover:bg-brand-50"
                  >
                    <Mail className="size-4 text-brand-600" />
                    {dict.common.emailNow}
                  </a>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-[#1fc75a]"
                  >
                    <MessageCircle className="size-4" />
                    {dict.common.whatsapp}
                  </a>
                </div>
              </div>

              <Link
                href={`/${locale}/properties`}
                className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 transition hover:text-brand-700"
              >
                <ArrowUpRight className="size-4 rtl:-scale-x-100" />
                {dict.common.backToListings}
              </Link>
            </aside>
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-ink-900">
            {dict.common.relatedProperties}
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => {
              const relatedName = item.name[locale]
              return (
                <Link
                  key={item.slug}
                  href={`/${locale}/properties/${item.slug}`}
                  className="group relative overflow-hidden rounded-3xl ring-1 ring-slate-200/70"
                >
                  <Image
                    src={item.images[0]}
                    alt={relatedName}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/25 to-transparent" />
                  <div className="relative flex h-full min-h-56 flex-col justify-end p-5">
                    <p className="text-sm font-extrabold text-white">
                      {relatedName}
                    </p>
                    <p className="mt-1 text-xs font-bold text-white/70">
                      {dict.cities[item.city]}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <StickyActions
        locale={locale}
        dict={dict}
        slug={property.slug}
        name={name}
      />
    </>
  )
}