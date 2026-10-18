"use client"

import Link from "next/link"
import Image from "next/image"
import { Bath, BedDouble, MapPin, MessageCircle, Ruler, Sofa } from "lucide-react"
import type { Dictionary } from "@/lib/dictionaries/types"
import type { Locale } from "@/lib/i18n"
import { formatPrice } from "@/lib/format"
import type { Property } from "@/lib/properties"
import { FavoriteButton } from "@/components/favorite-button"

/** Names we run ourselves, which get the office logo instead of a plain label. */
const OFFICE_NAMES =
  /^(إسكان العقارية|اسكان العقارية|Iskan Real Estate|iskan)$/i

/**
 * The horizontal half of the view toggle.
 *
 * Puts the image beside the details instead of above them, so a row costs about
 * a third of a card's height and the price, the district and the room counts can
 * all sit on one line — which is the whole point of switching to a list.
 */
export function PropertyListRow({
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
      value: property.area,
      label: dict.common.sqm,
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
      className={`card-raised group relative flex overflow-hidden rounded-xl border border-slate-200/80 bg-white ${className}`}
    >
      <div className="relative w-32 shrink-0 overflow-hidden bg-slate-100 sm:w-56">
        <div className="absolute inset-0">
          <Image
            src={property.images[0]}
            alt={name}
            fill
            sizes="(min-width: 640px) 224px, 128px"
            className="object-cover transition duration-700 group-hover:scale-[1.06]"
          />
        </div>

        <span
          className={`absolute start-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide backdrop-blur ${
            property.purpose === "rent"
              ? "bg-brand-400/90 text-white"
              : "bg-gold-400/95 text-ink-950"
          }`}
        >
          {purposeLabel}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <div className="flex min-w-0 items-center gap-1 text-[11px] font-semibold text-brand-700">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">{city}</span>
            </div>
            <p className="font-heading text-base font-bold leading-none text-ink-900">
              {formatPrice(property.price, property.currency)}
              <span className="ms-0.5 text-[10px] font-medium text-slate-400">
                {perMonth}
              </span>
            </p>
          </div>

          <h3 className="mt-1 line-clamp-1 font-heading text-sm font-bold leading-snug text-ink-900 transition-colors duration-300 group-hover:text-brand-700">
            {name}
          </h3>

          {specs.length > 0 && (
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-500">
              {specs.map(({ icon: Icon, value, label }) => (
                <span key={label} className="inline-flex items-center gap-1">
                  <Icon className="size-3 shrink-0 text-brand-600" />
                  {value} {label}
                </span>
              ))}
            </div>
          )}

          {advertiser && advertiserName && (
            <div className="mt-2 flex items-center gap-2">
              {isOffice ? (
                <Image
                  src="/iskan-logo.png"
                  alt={advertiserName}
                  width={256}
                  height={144}
                  className="h-4 w-auto shrink-0 object-contain"
                />
              ) : null}
              <span className="truncate text-[11px] font-bold text-slate-600">
                {advertiserName}
              </span>
              <span
                className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#25D366] px-2 py-0.5 text-[10px] font-bold text-white"
                aria-hidden
              >
                <MessageCircle className="size-3" />
                {dict.common.whatsapp}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Sits above the row link so the heart stays clickable on its own. */}
      <FavoriteButton slug={property.slug} compact className="absolute end-2 top-2" />
    </Link>
  )
}