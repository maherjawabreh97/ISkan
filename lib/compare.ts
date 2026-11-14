import type { Property } from "./properties"
import type { CityKey, PurposeKey } from "./dictionaries/types"

/** How many listings a visitor may place side by side. */
export const COMPARE_MAX = 4

/**
 * A listing saved to the comparison tray.
 *
 * The full `Property` is deliberately not stored: localStorage is tiny and the
 * JSON would go stale the moment an advertiser edits the listing. We keep just
 * enough to render the tray without a network round-trip, and the comparison
 * page always re-reads the live listing from the server.
 */
export type CompareEntry = {
  slug: string
  name?: { ar: string; en: string }
  image?: string
  price?: number
  currency?: string
  purpose?: PurposeKey
  city?: CityKey
  area?: number
  bedrooms?: number
}

export function toCompareEntry(property: Property): CompareEntry {
  return {
    slug: property.slug,
    name: property.name,
    image: property.images[0],
    price: property.price,
    currency: property.currency,
    purpose: property.purpose,
    city: property.city,
    area: property.area,
    bedrooms: property.bedrooms,
  }
}
