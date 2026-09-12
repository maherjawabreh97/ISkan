import Link from "next/link"
import Image from "next/image"
import { Bath, BedDouble, MapPin, Ruler } from "lucide-react"
import type { Dictionary } from "@/lib/dictionaries/types"
import type { Locale } from "@/lib/i18n"
import { formatPrice } from "@/lib/format"
import type { Property } from "@/lib/properties"

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
      className={`group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-brand-200 ${className}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={property.images[0]}
          alt={name}
          fill
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/10 to-transparent" />
        <span className="absolute start-4 top-4 rounded-full bg-gold-500 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-ink-950 shadow-md">
          {purposeLabel}
        </span>
        <div className="absolute inset-x-4 bottom-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/70">
            {dict.common.price}
          </p>
          <p className="text-xl font-extrabold text-white drop-shadow">
            {formatPrice(property.price)}
            <span className="text-sm font-bold text-white/70">{perMonth}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-brand-700">
          <MapPin className="size-3.5" />
          <span>{city}</span>
        </div>
        <h3 className="mt-1.5 text-lg font-extrabold leading-snug text-ink-900 transition group-hover:text-brand-700">
          {name}
        </h3>
        <div className="mt-auto flex items-center gap-4 border-t border-slate-100 pt-4 text-sm font-semibold text-slate-600">
          {showBedrooms && (
            <span className="inline-flex items-center gap-1.5">
              <BedDouble className="size-4 text-brand-600" />
              {property.bedrooms} {dict.common.beds}
            </span>
          )}
          {showBathrooms && (
            <span className="inline-flex items-center gap-1.5">
              <Bath className="size-4 text-brand-600" />
              {property.bathrooms} {dict.common.baths}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 ms-auto">
            <Ruler className="size-4 text-brand-600" />
            {property.area} {dict.common.sqm}
          </span>
        </div>
      </div>
    </Link>
  )
}