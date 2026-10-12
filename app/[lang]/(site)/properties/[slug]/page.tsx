import Link from "next/link"
import Image from "next/image"
import type { ReactNode } from "react"
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
  ShieldAlert,
  ShieldCheck,
  Sofa,
} from "lucide-react"
import { PropertyGallery } from "@/components/property-gallery"
import { StickyActions } from "@/components/sticky-actions"
import { VideoTour } from "@/components/video-tour"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"
import { formatPrice } from "@/lib/format"
import { getProperties, getStoredProperty } from "@/lib/properties-store"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ lang: string; slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { lang, slug } = await params
  const locale = hasLocale(lang) ? lang : "ar"
  const property = await getStoredProperty(slug)
  const dict = await getDictionary(locale)
  return {
    title: property ? `${property.name[locale]} — ${dict.brand.name}` : dict.meta.propertiesTitle,
  }
}

/** Small labelled section heading with a hairline accent. */
function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-7 bg-gold-500" />
      <h2 className="font-heading text-lg font-bold text-ink-900">{children}</h2>
    </div>
  )
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { lang, slug } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const dict = await getDictionary(locale)

  const property = await getStoredProperty(slug)
  if (!property) notFound()

  const name = property.name[locale]
  const city = dict.cities[property.city]
  const purposeLabel =
    property.purpose === "rent" ? dict.common.forRent : dict.common.forSale
  const purposeChip =
    property.purpose === "rent"
      ? "border-brand-500/30 bg-brand-500/10 text-brand-700"
      : "border-gold-500/40 bg-gold-500/10 text-gold-700"
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
    property.livingRooms > 0 && {
      icon: Sofa,
      label: dict.common.livingRooms,
      value: `${property.livingRooms}`,
    },
    {
      icon: Ruler,
      label: dict.common.area,
      value: `${property.area} ${dict.common.sqm}`,
    },
    property.netArea !== undefined && {
      icon: Ruler,
      label: dict.common.netArea,
      value: `${property.netArea} ${dict.common.sqm}`,
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
    property.floorLabel && {
      icon: Layers,
      label: dict.common.floor,
      value: property.floorLabel[locale],
    },
    (!property.floorLabel && property.floor !== undefined) && {
      icon: Layers,
      label: dict.common.floor,
      value: `${property.floor}`,
    },
  ].filter((item): item is Feature => Boolean(item))

  const whatsappHref = `https://wa.me/905432466309?text=${encodeURIComponent(
    `Hello Iskan! I'm interested in: ${name}, ${property.address[locale]}`,
  )}`

  const allProperties = await getProperties()

  const related = [
    ...allProperties.filter(
      (p) =>
        p.slug !== slug &&
        (p.city === property.city || p.type === property.type),
    ),
    ...allProperties.filter(
      (p) => p.slug !== slug && p.city !== property.city && p.type !== property.type,
    ),
  ].slice(0, 3)

  return (
    <>
      {/* ============================== Title block ============================== */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <nav className="flex flex-wrap items-center gap-2 py-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            <Link href={`/${locale}`} className="transition hover:text-ink-900">
              {dict.nav.home}
            </Link>
            <ChevronRight className="size-3 rtl:hidden" />
            <ChevronLeft className="size-3 ltr:hidden" />
            <Link
              href={`/${locale}/properties`}
              className="transition hover:text-ink-900"
            >
              {dict.nav.properties}
            </Link>
            <ChevronRight className="size-3 rtl:hidden" />
            <ChevronLeft className="size-3 ltr:hidden" />
            <span className="text-slate-500">{name}</span>
          </nav>

          <div className="grid gap-6 border-t border-slate-200/80 pb-8 pt-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${purposeChip}`}
                >
                  {purposeLabel}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  {dict.propertyTypes[property.type]}
                </span>
              </div>
              <h1 className="mt-4 font-heading text-[1.9rem] font-bold leading-[1.15] text-ink-900 sm:text-[2.5rem]">
                {name}
              </h1>
              <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-slate-500">
                <MapPin className="size-4 text-brand-600" />
                <span>{property.address[locale]}</span>
                <span className="text-slate-300">·</span>
                <span>{city}</span>
              </p>
            </div>

            <div className="lg:pb-1.5 lg:text-end">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {dict.common.price}
              </p>
              <p className="mt-1.5 font-heading text-3xl font-bold leading-none text-ink-900 sm:text-4xl">
                {formatPrice(property.price, property.currency)}
                <span className="ms-1.5 text-sm font-medium text-slate-400">
                  {perMonth}
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================== Gallery ============================== */}
      <section className="bg-white pb-4">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <PropertyGallery
            images={property.images}
            slug={property.slug}
            name={name}
            locale={locale}
          />
        </div>
      </section>

      {/* ============================== Body ============================== */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
            <div className="space-y-12">
              {/* Key facts */}
              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-200/70 sm:grid-cols-4">
                {features.map((feature) => (
                  <div key={feature.label} className="bg-white p-4 sm:p-5">
                    <feature.icon className="size-4 text-brand-600" />
                    <dt className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      {feature.label}
                    </dt>
                    <dd className="mt-1 font-heading text-base font-bold text-ink-900">
                      {feature.value}
                    </dd>
                  </div>
                ))}
              </dl>

              {/* Video tour */}
              {property.videos && property.videos.length > 0 && (
                <div>
                  <SectionTitle>{dict.common.videoTour}</SectionTitle>
                  <div className="mt-4">
                    <VideoTour
                      videos={property.videos}
                      poster={property.images[0]}
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <SectionTitle>{dict.common.description}</SectionTitle>
                <p className="mt-4 max-w-2xl text-[15px] leading-8 text-slate-600">
                  {property.description[locale]}
                </p>
              </div>

              {/* Requirements */}
              {property.requirements && (
                <div>
                  <SectionTitle>{dict.common.requirements}</SectionTitle>
                  <p className="mt-4 max-w-2xl whitespace-pre-line text-[15px] leading-8 text-slate-600">
                    {property.requirements[locale]}
                  </p>
                </div>
              )}

              {/* Amenities */}
              {property.amenities.length > 0 && (
                <div>
                  <SectionTitle>{dict.common.amenities}</SectionTitle>
                  <ul className="mt-4 grid gap-x-10 gap-y-3 sm:grid-cols-2">
                    {property.amenities.map((amenity) => (
                      <li
                        key={amenity}
                        className="flex items-center gap-3 text-sm font-medium text-ink-800"
                      >
                        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
                          <Check className="size-3" />
                        </span>
                        {dict.amenities[amenity]}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* ============================== Contact ============================== */}
            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6">
                <div className="flex items-center gap-3.5">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ink-900 font-heading text-lg font-bold text-white">
                    {property.agent.name[locale].charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      {dict.common.agent}
                    </p>
                    <p className="truncate font-heading text-lg font-bold text-ink-900">
                      {property.agent.name[locale]}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-0.5 border-t border-slate-100 pt-4">
                  <a
                    href={`tel:${property.agent.phone}`}
                    className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-semibold text-ink-800 transition hover:bg-sand-50"
                  >
                    <Phone className="size-4 text-brand-600" />
                    <span dir="ltr">{property.agent.phone}</span>
                  </a>
                  <a
                    href={`mailto:${property.agent.email}`}
                    className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-semibold text-ink-800 transition hover:bg-sand-50"
                  >
                    <Mail className="size-4 text-brand-600" />
                    <span className="truncate">{property.agent.email}</span>
                  </a>
                </div>

                <div className="mt-4 grid gap-2.5">
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#1eb85a]"
                  >
                    <MessageCircle className="size-4" />
                    {dict.common.whatsapp}
                  </a>
                  <a
                    href={`tel:${property.agent.phone}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink-900 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-ink-800"
                  >
                    <Phone className="size-4" />
                    {dict.common.callNow}
                  </a>
                  <a
                    href={`mailto:${property.agent.email}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-ink-900 transition hover:border-brand-400 hover:bg-brand-50"
                  >
                    <Mail className="size-4 text-brand-600" />
                    {dict.common.emailNow}
                  </a>
                </div>
              </div>

              {property.citizenshipEligible === false && (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                  <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
                  <div>
                    <p className="text-sm font-bold text-amber-800">
                      {dict.common.citizenshipTitle}
                    </p>
                    <p className="mt-1 text-[13px] leading-6 text-amber-700/90">
                      {dict.common.citizenshipNotEligible}
                    </p>
                  </div>
                </div>
              )}

              {property.citizenshipEligible === true && (
                <div className="flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50/70 p-4">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-600" />
                  <p className="text-[13px] font-medium leading-6 text-brand-800">
                    {dict.common.citizenshipEligible}
                  </p>
                </div>
              )}

              <Link
                href={`/${locale}/properties`}
                className="inline-flex items-center gap-2 px-1 text-sm font-bold text-slate-500 transition hover:text-brand-700"
              >
                <ArrowUpRight className="size-4 rtl:-scale-x-100" />
                {dict.common.backToListings}
              </Link>
            </aside>
          </div>
        </div>
      </section>

      {/* ============================== Related ============================== */}
      {related.length > 0 && (
        <section className="border-t border-slate-200/80 bg-white py-14 lg:py-16">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-heading text-2xl font-bold text-ink-900">
                {dict.common.relatedProperties}
              </h2>
              <Link
                href={`/${locale}/properties`}
                className="hidden items-center gap-1.5 text-sm font-bold text-brand-700 transition hover:text-brand-800 sm:inline-flex"
              >
                {dict.common.viewAll}
                <ArrowUpRight className="size-4 rtl:-scale-x-100" />
              </Link>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/${locale}/properties/${item.slug}`}
                  className="group"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
                    <Image
                      src={item.images[0]}
                      alt={item.name[locale]}
                      fill
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate font-heading text-base font-bold text-ink-900 transition group-hover:text-brand-700">
                        {item.name[locale]}
                      </h3>
                      <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                        <MapPin className="size-3.5 text-brand-600" />
                        {dict.cities[item.city]}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-bold text-ink-900">
                      {formatPrice(item.price, item.currency)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <StickyActions
        locale={locale}
        dict={dict}
        slug={property.slug}
        name={name}
      />
    </>
  )
}
