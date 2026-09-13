"use client"

import Link from "next/link"
import Image from "next/image"
import { Bath, BedDouble, MapPin, Ruler, TrendingUp } from "lucide-react"
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

  return (
    <Link
      href={href}
      className={`card-raised group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white shadow-soft ${className}`}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-gold-400/70 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />

      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={property.images[0]}
          alt={name}
          fill
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/15 to-transparent" />

        <span
          className={`absolute start-4 top-4 rounded-full px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider shadow-lg backdrop-blur ${
            property.purpose === "rent"
              ? "bg-brand-400/90 text-white"
              : "bg-gold-400/95 text-ink-950"
          }`}
        >
          {purposeLabel}
        </span>
        <FavoriteButton slug={property.slug} className="absolute end-4 top-4 z-10" />

        <div className="absolute inset-x-0 bottom-0 p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/60">
                {dict.common.price}
              </p>
              <p className="mt-0.5 text-2xl font-extrabold leading-none text-white drop-shadow-lg">
                {formatPrice(property.price)}
                <span className="ms-1 text-xs font-bold text-white/70">
                  {perMonth}
                </span>
              </p>
            </div>
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl border border-white/25 bg-white/15 text-gold-300 opacity-0 backdrop-blur transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100 rtl:-scale-x-100 rtl:group-hover:-translate-x-0">
              <TrendingUp className="size-4.5" />
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-brand-700">
          <MapPin className="size-3.5" />
          <span>{city}</span>
          <span className="ms-auto h-1 w-6 rounded-full bg-sand-200 transition-colors duration-500 group-hover:bg-gold-400" />
        </div>
        <h3 className="mt-1.5 text-lg font-extrabold leading-snug text-ink-900 transition-colors duration-300 group-hover:text-brand-700">
          {name}
        </h3>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          {showBedrooms && (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-sand-100 px-3 py-1.5 text-[13px] font-bold text-ink-800 ring-1 ring-slate-200/60">
              <BedDouble className="size-3.5 text-brand-600" />
              {property.bedrooms} {dict.common.beds}
            </span>
          )}
          {showBathrooms && (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-sand-100 px-3 py-1.5 text-[13px] font-bold text-ink-800 ring-1 ring-slate-200/60">
              <Bath className="size-3.5 text-brand-600" />
              {property.bathrooms} {dict.common.baths}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-sand-100 px-3 py-1.5 text-[13px] font-bold text-ink-800 ring-1 ring-slate-200/60">
            <Ruler className="size-3.5 text-brand-600" />
            {property.area} {dict.common.sqm}
          </span>
        </div>
      </div>
    </Link>
  )
}