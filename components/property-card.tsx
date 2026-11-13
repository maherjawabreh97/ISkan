"use client"

import Link from "next/link"
import Image from "next/image"
import { Bath, BedDouble, MapPin, Ruler, Sofa } from "lucide-react"
import type { Dictionary } from "@/lib/dictionaries/types"
import type { Locale } from "@/lib/i18n"
import { formatPrice } from "@/lib/format"
import { useCurrency } from "@/lib/use-currency"
import { formatDisplayPrice } from "@/lib/currency"
import { useAreaUnit, convertArea } from "@/lib/use-area-unit"
import type { Property } from "@/lib/properties"
import { FavoriteButton } from "@/components/favorite-button"
import { toggleCompare, useCompare } from "@/lib/use-compare"
import { PropertyCardGallery } from "@/components/property-card-gallery"
import { WhatsAppIcon } from "@/components/whatsapp-icon"

/** Names we run ourselves, which get the office logo instead of a plain label. */
const OFFICE_NAMES =
  /^(إسكان العقارية|اسكان العقارية|Iskan Real Estate|iskan)$/i

export function PropertyCard({
  property,
  locale,
  dict,
  className = "",
}: {
  property: Property
  locale: Locale
  dict: Dictionary
  className?: string
}) {
  const href = `/${locale}/properties/${property.slug}`
  const name = property.name[locale]
  const city = dict.cities[property.city]
  const purposeLabel =
    property.purpose === "rent" ? dict.common.forRent : dict.common.forSale
  const perMonth = property.pricePerMonth ? ` ${dict.common.perMonth}` : ""

  const [displayCurrency] = useCurrency()
  const [areaUnit] = useAreaUnit()

  const specs = [
    property.bedrooms > 0 && {
      icon: BedDouble,
      value: property.bedrooms,
      label: dict.common.beds,
    },
    property.bathrooms > 0 && {
      icon: Bath,
      value: property.bathrooms,
      label: dict.common.baths,
    },
    property.livingRooms > 0 && {
      icon: Sofa,
      value: property.livingRooms,
      label: dict.common.livingRooms,
    },
    property.area > 0 && {
      icon: Ruler,
      value: Math.round(convertArea(property.area, areaUnit)),
      label: areaUnit === "ft2" ? "ft²" : dict.common.sqm,
    },
  ].filter(Boolean) as Array<{
    icon: typeof BedDouble
    value: number
    label: string
  }>

  const advertiser = property.advertiser
  const advertiserName = advertiser?.name[locale]
  const isOffice = advertiserName ? OFFICE_NAMES.test(advertiserName) : false

  return (
    <Link
      href={href}
      className={`card-raised group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-[0_2px_8px_-4px_rgba(6,13,22,0.08),0_8px_24px_-12px_rgba(6,13,22,0.12)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_24px_-8px_rgba(6,13,22,0.18),0_20px_40px_-16px_rgba(6,13,22,0.2)] hover:border-brand-300/60 ${className}`}    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <PropertyCardGallery images={property.images} alt={name} locale={locale} />

        <span
          className={`pointer-events-none absolute start-2.5 top-2.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide backdrop-blur ${
            property.purpose === "rent"
              ? "bg-brand-400/90 text-white"
              : "bg-gold-400/95 text-ink-950"
          }`}
        >
          {purposeLabel}
        </span>

        {/* Special-attribute badges (top-end, stacked). */}
        <span className="pointer-events-none absolute end-2.5 top-2.5 flex flex-col items-end gap-1">
          {property.citizenshipEligible === true && (
            <span className="rounded-full bg-emerald-500/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur">
              {dict.common.citizenshipEligibleShort}
            </span>
          )}
          {property.installment && (
            <span className="rounded-full bg-blue-500/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur">
              {dict.common.installment}
            </span>
          )}
          {property.underConstruction && (
            <span className="rounded-full bg-amber-500/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur">
              {dict.common.underConstruction}
            </span>
          )}
          {property.readyToMove && (
            <span className="rounded-full bg-teal-500/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur">
              {dict.common.readyToMove}
            </span>
          )}
          {property.luxury && (
            <span className="rounded-full bg-ink-950/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-gold-300 backdrop-blur">
              {dict.common.luxury}
            </span>
          )}
          {property.seaView && (
            <span className="rounded-full bg-sky-500/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur">
              {dict.common.seaView}
            </span>
          )}
        </span>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/80 via-ink-950/40 to-transparent px-3 pb-2.5 pt-8">
          <p className="font-heading text-sm font-bold leading-none text-white drop-shadow-md">
            {formatDisplayPrice(property.price, property.currency, displayCurrency)}
            <span className="ms-0.5 text-[10px] font-medium text-white/80">
              {perMonth}
            </span>
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-2.5">
        <div className="flex items-center gap-1 text-[10px] font-semibold text-brand-700">
          <MapPin className="size-3 shrink-0" />
          <span className="truncate">{city}</span>
        </div>

        <h3 className="mt-1 line-clamp-2 font-heading text-[12px] font-bold leading-snug text-ink-900 transition-colors duration-300 group-hover:text-brand-700">
          {name}
        </h3>

        {specs.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 pt-2 text-[11px] font-semibold text-slate-500">
            {specs.map(({ icon: Icon, value, label }) => (
              <span key={label} className="inline-flex items-center gap-1">
                <Icon className="size-3 shrink-0 text-brand-600" />
                {value} {label}
              </span>
            ))}
          </div>
        )}

        {/* The heart lives here rather than floating over the artwork: on a
            narrow phone the card image is barely taller than the button, so it
            sat on top of the price. Last in the row puts it on the left in
            both reading directions. */}
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
          {advertiser && advertiserName ? (
            <div className="flex min-w-0 items-center gap-1.5">
              {isOffice ? (
                <Image
                  src="/iskan-logo.png"
                  alt={advertiserName}
                  width={256}
                  height={144}
                  className="h-4 w-auto shrink-0 object-contain"
                />
              ) : null}
              <span className="truncate font-heading text-[11px] font-bold text-ink-900">
                {advertiserName}
              </span>
            </div>
          ) : (
            <span className="truncate text-[11px] font-semibold text-slate-400">
              {dict.propertyTypes[property.type]}
            </span>
          )}

          <span className="flex shrink-0 items-center gap-1.5">
            {advertiser && (
              <span
                className="inline-flex items-center gap-1 rounded-lg bg-gold-400 px-2 py-1 text-[10px] font-bold text-ink-950"
                aria-hidden
              >
                <WhatsAppIcon className="size-3" />
                {dict.common.whatsapp}
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleCompare(property.slug)
              }}
              aria-label="Compare"
              className="grid size-8 place-items-center rounded-full bg-white/90 text-slate-500 ring-1 ring-slate-200 transition hover:text-brand-700"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="18" rx="1" />
                <rect x="14" y="3" width="7" height="18" rx="1" />
              </svg>
            </button>
            <FavoriteButton slug={property.slug} compact dict={dict} />
          </span>
        </div>
      </div>
    </Link>
  )
}