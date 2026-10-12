export type LocalizedString = Record<"en" | "ar", string>

export type CityKey =
  | "kadikoy"
  | "besiktas"
  | "bakirkoy"
  | "fatih"
  | "beyoglu"
  | "sisli"
  | "kayashehir"
  | "bagcilar"

export type PropertyTypeKey =
  | "apartment"
  | "villa"
  | "office"
  | "land"
  | "tourist_apartment"

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
    submit: string
  }
  hero: {
    badge: string
    title1: string
    titleHighlight: string
    title2: string
    subtitle: string
    searchButton: string
    listCta: string
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
    livingRooms: string
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
    requirements: string
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
    netArea: string
    citizenshipTitle: string
    citizenshipNotEligible: string
    citizenshipEligible: string
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
    empty: string
    emptyDesc: string
    addCta: string
    formTitle: string
    formHint: string
    name: string
    namePlaceholder: string
    role: string
    rolePlaceholder: string
    text: string
    textPlaceholder: string
    submit: string
    submitting: string
    successTitle: string
    successBody: string
    cancel: string
    errorRequired: string
    errorCaptcha: string
    errorRate: string
    privacyNote: string
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
  submit: {
    badge: string
    title: string
    subtitle: string
    formTitle: string
    contactSection: string
    name: string
    namePlaceholder: string
    phone: string
    phonePlaceholder: string
    email: string
    emailOptional: string
    listingSection: string
    listingTitle: string
    listingTitlePlaceholder: string
    city: string
    propertyType: string
    purpose: string
    price: string
    currency: string
    pricePerMonth: string
    area: string
    bedrooms: string
    bathrooms: string
    livingRooms: string
    floor: string
    furnished: string
    address: string
    addressPlaceholder: string
    description: string
    descriptionPlaceholder: string
    photosSection: string
    photosHelp: string
    photosEmpty: string
    removePhoto: string
    consent: string
    privacyLink: string
    submitButton: string
    successTitle: string
    successBody: string
    successWhatsapp: string
    successAgain: string
    errorRequired: string
    errorCaptcha: string
    errorRate: string
    asideTitle: string
    asideBody: string
    whatsappCta: string
    whatsappPrefill: string
    responseNote: string
    sellNote: string
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
    submitTitle: string
    submitDescription: string
  }
}