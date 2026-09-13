export type LocalizedString = Record<"en" | "ar", string>

export type CityKey =
  | "riyadh"
  | "jeddah"
  | "dammam"
  | "mecca"
  | "dubai"
  | "abu-dhabi"

export type PropertyTypeKey =
  | "apartment"
  | "villa"
  | "penthouse"
  | "townhouse"
  | "office"
  | "land"

export type PurposeKey = "sale" | "rent"

export type AmenityKey =
  | "pool"
  | "gym"
  | "parking"
  | "garden"
  | "security"
  | "wifi"
  | "elevator"
  | "balcony"
  | "furnished"
  | "centralAc"
  | "kidsPlay"
  | "smartHome"

export interface Dictionary {
  brand: {
    name: string
    officeName: string
    tagline: string
  }
  nav: {
    home: string
    properties: string
    contact: string
  }
  hero: {
    badge: string
    title1: string
    titleHighlight: string
    title2: string
    subtitle: string
    searchButton: string
    statProperties: string
    statCustomers: string
    statCities: string
    statYears: string
  }
  common: {
    forSale: string
    forRent: string
    beds: string
    baths: string
    area: string
    sqm: string
    perMonth: string
    viewAll: string
    results: string
    noResults: string
    noResultsDesc: string
    clearFilters: string
    searchButton: string
    searchPlaceholder: string
    propertyType: string
    purpose: string
    allTypes: string
    allCities: string
    allPurposes: string
    minPrice: string
    maxPrice: string
    sortBy: string
    sortNewest: string
    sortPriceAsc: string
    sortPriceDesc: string
    features: string
    amenities: string
    description: string
    agent: string
    phone: string
    email: string
    callNow: string
    emailNow: string
    relatedProperties: string
    backToListings: string
    yearBuilt: string
    parking: string
    floor: string
    price: string
    cityLabel: string
    properties: string
    browseNow: string
    locationOnMap: string
    all: string
    favorites: string
    save: string
    saved: string
    whatsapp: string
  }
  sections: {
    featuredTitle: string
    featuredSubtitle: string
    browseTitle: string
    browseSubtitle: string
    whyTitle: string
    whySubtitle: string
    latestTitle: string
    latestSubtitle: string
    ctaTitle: string
    ctaSubtitle: string
    ctaButton: string
    testimonialsTitle: string
    testimonialsSubtitle: string
  }
  testimonials: {
    items: {
      quote: string
      name: string
      role: string
    }[]
  }
  why: {
    oneTitle: string
    oneDesc: string
    twoTitle: string
    twoDesc: string
    threeTitle: string
    threeDesc: string
    fourTitle: string
    fourDesc: string
  }
  propertyTypes: Record<PropertyTypeKey, string>
  propertyTypeDescriptions: Record<PropertyTypeKey, string>
  cities: Record<CityKey, string>
  amenities: Record<AmenityKey, string>
  footer: {
    aboutTitle: string
    about: string
    quickLinks: string
    contactTitle: string
    rights: string
    madeWith: string
    exploreTitle: string
    legalTitle: string
    privacy: string
    cookies: string
    backHome: string
  }
  legal: {
    privacyTitle: string
    privacyIntro: string
    privacyDate: string
    privacySections: { heading: string; body: string }[]
    cookiesTitle: string
    cookiesIntro: string
    cookiesDate: string
    cookiesSections: { heading: string; body: string }[]
  }
  meta: {
    homeTitle: string
    homeDescription: string
    propertiesTitle: string
    propertiesDescription: string
    privacyTitle: string
    privacyDescription: string
    cookiesTitle: string
    cookiesDescription: string
  }
}