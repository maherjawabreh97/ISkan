"use client"

import Link from "next/link"
import Image from "next/image"
import { Clock3, MapPin } from "lucide-react"
import type { Dictionary } from "@/lib/dictionaries/types"
import type { Locale } from "@/lib/i18n"
import type { Property } from "@/lib/properties"
import { PriceDisplay } from "@/components/price-display"
import { useRecentlyViewed } from "@/lib/use-recently-viewed"

/**
 * "Recently viewed" strip.
 *
 * Rendered on the listings page and the detail page. The list is read from
 * localStorage after hydration, so it stays empty (and invisible) on the server
 * and for first-time visitors.
 */
export function RecentlyViewed({
  properties,
  locale,
  dict,
  excludeSlug,
  className = "",
}: {
  properties: Property[]
  locale: Locale
  dict: Dictionary
  excludeSlug?: string
  className?: string
}) {
  const slugs = useRecentlyViewed()

  const items = slugs
    .filter((slug) => slug !== excludeSlug)
    .map((slug) => properties.find((property) => property.slug === slug))
    .filter((property): property is Property => Boolean(property))
    .slice(0, 6)

  if (items.length === 0) return null

  return (
    <section className={className}>
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 place-items-center rounded-full bg-brand-50 text-brand-700">
          <Clock3 className="size-4" />
        </span>
        <h2 className="font-heading text-lg font-bold text-ink-900">
          {locale === "ar" ? "شوهدت مؤخراً" : "Recently viewed"}
        </h2>
      </div>

      <div className="scrollbar-none mt-4 flex gap-3 overflow-x-auto pb-1">
        {items.map((property) => (
          <Link
            key={property.slug}
            href={`/${locale}/properties/${property.slug}`}
            className="group w-44 shrink-0 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:ring-brand-300 hover:shadow-md"
          >
            <div className="relative aspect-[4/3] bg-slate-100">
              {property.images[0] && (
                <Image
                  src={property.images[0]}
                  alt={property.name[locale]}
                  fill
                  sizes="176px"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              )}
            </div>
            <div className="p-2.5">
              <p className="line-clamp-1 font-heading text-[12px] font-bold text-ink-900 group-hover:text-brand-700">
                {property.name[locale]}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                <MapPin className="size-2.5 text-brand-600" />
                {dict.cities[property.city]}
              </p>
              <p className="mt-1.5 text-[12px] font-bold text-ink-900">
                <PriceDisplay value={property.price} currency={property.currency} />
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
