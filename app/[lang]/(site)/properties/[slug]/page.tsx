import Link from "next/link"
import Image from "next/image"
import type { ReactNode } from "react"
import { notFound } from "next/navigation"
import {
  AlertCircle,
  ArrowUpRight,
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Images,
  Layers,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  ShieldAlert,
  ShieldCheck,
  Sofa,
  User,
} from "lucide-react"
import { PropertyGallery } from "@/components/property-gallery"
import { PropertyMap } from "@/components/admin/location-picker"
import { StickyActions } from "@/components/sticky-actions"
import { VideoTour } from "@/components/video-tour"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"
import { formatPrice } from "@/lib/format"
import { getProperties, getStoredProperty } from "@/lib/properties-store"
import { defaultRentAdvertiser } from "@/lib/properties"

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

  const quickFacts: Feature[] = [
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
    property.area > 0 && {
      icon: Ruler,
      label: dict.common.area,
      value: `${property.area} ${dict.common.sqm}`,
    },
    property.netArea !== undefined && {
      icon: Ruler,
      label: dict.common.netArea,
      value: `${property.netArea} ${dict.common.sqm}`,
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
  ].filter((item): item is Feature => Boolean(item))

  const advertiser =
    property.advertiser ??
    (property.purpose === "rent" ? defaultRentAdvertiser : undefined)
  const isOfficeAdvertiser = advertiser
    ? /^(إسكان العقارية|اسكان العقارية|Iskan Real Estate|iskan)$/i.test(
        advertiser.name.ar,
      ) ||
      /^(إسكان العقارية|اسكان العقارية|Iskan Real Estate|iskan)$/i.test(
        advertiser.name.en,
      )
    : false

  /** The single contact identity shown on the page. */
  const contact = advertiser
    ? {
        name: advertiser.name[locale],
        label: dict.common.advertiser,
        whatsapp: advertiser.whatsapp.replace(/\D/g, ""),
        isOffice: isOfficeAdvertiser,
      }
    : {
        name: property.agent.name[locale],
        label: dict.common.agent,
        whatsapp: property.agent.phone.replace(/\D/g, ""),
        isOffice: true,
      }

  const whatsappHref = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(
    locale === "ar"
      ? `مرحباً إسكان! شفت الإعلان: ${name} — ${property.address[locale]}. بدي أعرف تفاصيل أكثر.`
      : `Hello Iskan! I saw this listing: ${name} — ${property.address[locale]}. I'd like more details.`,
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
      {/* ============================== Listing ============================== */}
      <section className="bg-sand-50">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
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
            <span className="truncate text-slate-500">{name}</span>
          </nav>

          <div className="grid gap-6 pb-16 pt-2 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
            {/* Compact header so the name and price are visible before the photos on mobile. */}
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 lg:hidden">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${purposeChip}`}
                >
                  {purposeLabel}
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
                  {dict.propertyTypes[property.type]}
                </span>
                {property.citizenshipEligible === true && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700 ring-1 ring-emerald-200">
                    <ShieldCheck className="size-3.5" />
                    {dict.common.citizenshipEligibleShort}
                  </span>
                )}
              </div>
              <h1 className="mt-3 font-heading text-[1.5rem] font-bold leading-[1.2] text-ink-900">
                {name}
              </h1>
              <p className="mt-2 flex items-start gap-2 text-sm font-medium leading-6 text-slate-500">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" />
                <span>
                  {property.address[locale]}
                  {property.address[locale] ? (
                    <span className="text-slate-300"> · </span>
                  ) : null}
                  {city}
                </span>
              </p>
              <p className="mt-4 font-heading text-[1.75rem] font-bold leading-none text-ink-900">
                {formatPrice(property.price, property.currency)}
                <span className="ms-1.5 text-sm font-medium text-slate-400">
                  {perMonth}
                </span>
              </p>
            </div>

            {/* ---------------------------- Media + content ---------------------------- */}
            <div className="min-w-0">
              <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70">
                <PropertyGallery
                  images={property.images}
                  slug={property.slug}
                  name={name}
                  locale={locale}
                />
              </div>

              {property.videos && property.videos.length > 0 && (
                <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
                  <SectionTitle>{dict.common.videoTour}</SectionTitle>
                  <div className="mt-4">
                    <VideoTour
                      videos={property.videos}
                      poster={property.images[0]}
                      locale={locale}
                    />
                  </div>
                </div>
              )}

              <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 sm:p-8">
                <SectionTitle>{dict.common.description}</SectionTitle>
                <p className="mt-4 whitespace-pre-line text-[15px] leading-8 text-slate-600">
                  {property.description[locale]}
                </p>
              </div>

              {property.requirements && (
                <div className="mt-6 rounded-3xl border border-amber-200/80 bg-amber-50/70 p-6 sm:p-8">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="size-5 shrink-0 text-amber-600" />
                    <h2 className="font-heading text-lg font-bold text-amber-900">
                      {dict.common.requirements}
                    </h2>
                  </div>
                  <p className="mt-4 whitespace-pre-line text-[15px] leading-8 text-amber-900/90">
                    {property.requirements[locale]}
                  </p>
                </div>
              )}

              {property.amenities.length > 0 && (
                <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 sm:p-8">
                  <SectionTitle>{dict.common.amenities}</SectionTitle>
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {property.amenities.map((amenity) => (
                      <li
                        key={amenity}
                        className="flex items-center gap-3 rounded-2xl bg-sand-50 px-4 py-3 text-sm font-semibold text-ink-800"
                      >
                        <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                          <Check className="size-3.5" />
                        </span>
                        {dict.amenities[amenity]}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {property.location && (
                <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 sm:p-8">
                  <SectionTitle>{dict.common.locationOnMap}</SectionTitle>
                  <p className="mt-2 text-sm font-medium text-slate-500">
                    {property.address[locale] || city}
                  </p>
                  <div className="mt-4">
                    <PropertyMap
                      lat={property.location.lat}
                      lng={property.location.lng}
                      label={property.location.label}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ---------------------------- Sticky summary ---------------------------- */}
            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${purposeChip}`}
                  >
                    {purposeLabel}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
                    {dict.propertyTypes[property.type]}
                  </span>
                  {property.citizenshipEligible === true && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700 ring-1 ring-emerald-200">
                      <ShieldCheck className="size-3.5" />
                      {dict.common.citizenshipEligibleShort}
                    </span>
                  )}
                </div>

                <p className="mt-4 font-heading text-[1.6rem] font-bold leading-[1.2] text-ink-900 sm:text-[2rem]">
                  {name}
                </p>

                <p className="mt-3 flex items-start gap-2 text-sm font-medium leading-6 text-slate-500">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" />
                  <span>
                    {property.address[locale]}
                    {property.address[locale] ? (
                      <span className="text-slate-300"> · </span>
                    ) : null}
                    {city}
                  </span>
                </p>

                <div className="mt-5 rounded-2xl bg-ink-900 px-5 py-4 text-white">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
                    {dict.common.price}
                  </p>
                  <p className="mt-1 font-heading text-3xl font-bold leading-none">
                    {formatPrice(property.price, property.currency)}
                    <span className="ms-1.5 text-sm font-medium text-white/60">
                      {perMonth}
                    </span>
                  </p>
                </div>

                {quickFacts.length > 0 ? (
                  <dl className="mt-5 grid grid-cols-2 gap-2">
                    {quickFacts.map((fact) => (
                      <div
                        key={fact.label}
                        className="flex items-center gap-2.5 rounded-2xl bg-sand-50 px-3.5 py-2.5"
                      >
                        <fact.icon className="size-4 shrink-0 text-brand-600" />
                        <div className="min-w-0">
                          <dt className="truncate text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                            {fact.label}
                          </dt>
                          <dd className="truncate font-heading text-sm font-bold text-ink-900">
                            {fact.value}
                          </dd>
                        </div>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2.5 rounded-2xl bg-sand-50 px-3.5 py-2.5">
                      <Building2 className="size-4 shrink-0 text-brand-600" />
                      <div className="min-w-0">
                        <dt className="truncate text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                          {dict.common.propertyType}
                        </dt>
                        <dd className="truncate font-heading text-sm font-bold text-ink-900">
                          {dict.propertyTypes[property.type]}
                        </dd>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 rounded-2xl bg-sand-50 px-3.5 py-2.5">
                      <MapPin className="size-4 shrink-0 text-brand-600" />
                      <div className="min-w-0">
                        <dt className="truncate text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                          {dict.common.cityLabel}
                        </dt>
                        <dd className="truncate font-heading text-sm font-bold text-ink-900">
                          {city}
                        </dd>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                  <p className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <CalendarDays className="size-3.5" />
                    {dict.common.dateAdded} {property.dateAdded}
                  </p>
                  {property.images.length > 0 && (
                    <p className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                      <Images className="size-3.5" />
                      {property.images.length} {dict.common.photos}
                    </p>
                  )}
                </div>
              </div>

              {/* Contact */}
              <div className="rounded-3xl border-2 border-brand-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 p-1">
                    {contact.isOffice ? (
                      <Image
                        src="/iskan-logo.png"
                        alt={contact.name}
                        width={256}
                        height={144}
                        className="h-auto w-full object-contain"
                      />
                    ) : (
                      <User className="size-6 text-brand-700" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700">
                      {contact.label}
                    </p>
                    <p className="mt-0.5 truncate font-heading text-lg font-bold text-ink-900">
                      {contact.name}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-2.5">
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-[#1eb85a]"
                  >
                    <MessageCircle className="size-4.5" />
                    {dict.common.whatsapp}
                  </a>
                  <a
                    href={`tel:+${contact.whatsapp}`}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ink-900 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-ink-800"
                  >
                    <Phone className="size-4.5" />
                    {dict.common.callNow}
                  </a>
                </div>

                <div className="mt-4 space-y-0.5 border-t border-slate-100 pt-3">
                  <a
                    href={`tel:${property.agent.phone}`}
                    className="flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-semibold text-ink-700 transition hover:bg-sand-50"
                  >
                    <Phone className="size-4 text-brand-600" />
                    <span dir="ltr">{property.agent.phone}</span>
                  </a>
                  <a
                    href={`mailto:${property.agent.email}`}
                    className="flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-semibold text-ink-700 transition hover:bg-sand-50"
                  >
                    <Mail className="size-4 text-brand-600" />
                    <span className="truncate">{property.agent.email}</span>
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
                    {item.images[0] && (
                      <Image
                        src={item.images[0]}
                        alt={item.name[locale]}
                        fill
                        sizes="(min-width: 1024px) 33vw, 100vw"
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />
                    )}
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
