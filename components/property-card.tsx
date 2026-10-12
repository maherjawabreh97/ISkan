"use client"

import Link from "next/link"
import Image from "next/image"
import { Bath, BedDouble, MapPin, Ruler, Sofa } from "lucide-react"
import type { Dictionary } from "@/lib/dictionaries/types"
import type { Locale } from "@/lib/i18n"
import { formatPrice } from "@/lib/format"
import type { Property } from "@/lib/properties"
import { FavoriteButton } from "@/components/favorite-button"

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
  const showBedrooms = property.bedrooms > 0
  const showBathrooms = property.bathrooms > 0
  const showLivingRooms = property.livingRooms > 0

  return (
    <Link
      href={href}
      className={`card-raised group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white ${className}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <Image
          src={property.images[0]}
          alt={name}
          fill
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/10 to-transparent" />

        <span
          className={`absolute start-3.5 top-3.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide backdrop-blur ${
            property.purpose === "rent"
              ? "bg-brand-400/90 text-white"
              : "bg-gold-400/95 text-ink-950"
          }`}
        >
          {purposeLabel}
        </span>
        <FavoriteButton slug={property.slug} className="absolute end-3.5 top-3.5 z-10" />

        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="font-heading text-xl font-bold leading-none text-white drop-shadow">
            {formatPrice(property.price, property.currency)}
            <span className="ms-1 text-xs font-medium text-white/75">{perMonth}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-700">
          <MapPin className="size-3.5" />
          <span>{city}</span>
        </div>
        <h3 className="mt-1.5 font-heading text-lg font-bold leading-snug text-ink-900 transition-colors duration-300 group-hover:text-brand-700">
          {name}
        </h3>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-[13px] font-semibold text-slate-500">
          {showBedrooms && (
            <span className="inline-flex items-center gap-1.5">
              <BedDouble className="size-3.5 text-brand-600" />
              {property.bedrooms} {dict.common.beds}
            </span>
          )}
          {showBathrooms && (
            <span className="inline-flex items-center gap-1.5">
              <Bath className="size-3.5 text-brand-600" />
              {property.bathrooms} {dict.common.baths}
            </span>
          )}
          {showLivingRooms && (
            <span className="inline-flex items-center gap-1.5">
              <Sofa className="size-3.5 text-brand-600" />
              {property.livingRooms} {dict.common.livingRooms}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Ruler className="size-3.5 text-brand-600" />
            {property.area} {dict.common.sqm}
          </span>
        </div>
      </div>
    </Link>
  )
}
