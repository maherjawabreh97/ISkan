import type {
  AmenityKey,
  CityKey,
  LocalizedString,
  PropertyTypeKey,
  PurposeKey,
} from "./dictionaries/types"
import type { CurrencyKey } from "./format"

export interface Property {
  slug: string
  type: PropertyTypeKey
  purpose: PurposeKey
  price: number
  currency?: CurrencyKey
  pricePerMonth?: boolean
  area: number
  netArea?: number
  bedrooms: number
  bathrooms: number
  parking: number
  yearBuilt: number
  floor?: number
  floorLabel?: LocalizedString
  citizenshipEligible?: boolean
  city: CityKey
  featured: boolean
  dateAdded: string
  name: LocalizedString
  address: LocalizedString
  description: LocalizedString
  amenities: AmenityKey[]
  images: string[]
  agent: {
    name: LocalizedString
    role: string
    phone: string
    email: string
  }
}

const maveraImages = Array.from(
  { length: 13 },
  (_, index) => `/properties/mavera-3/${String(index + 1).padStart(2, "0")}.jpg`,
)

const office = {
  name: { en: "Iskan Real Estate", ar: "إسكان العقارية" },
  role: "real-estate",
  phone: "+905432466309",
  email: "Iskanrealestatetr@gmail.com",
}

export const properties: Property[] = [
  {
    slug: "mavera-3-kayashehir",
    type: "apartment",
    purpose: "sale",
    price: 390000,
    currency: "USD",
    area: 160,
    netArea: 126,
    bedrooms: 3,
    bathrooms: 1,
    parking: 0,
    yearBuilt: 0,
    floor: 0,
    floorLabel: { en: "Ground floor (garden)", ar: "طابق حديقة" },
    citizenshipEligible: false,
    city: "kayashehir",
    featured: false,
    dateAdded: "2026-09-26",
    name: {
      en: "Mavera 3 — 3.5+1 Garden Floor Apartment",
      ar: "ماڤيرا 3 — شقة 3.5+1 طابق حديقة",
    },
    address: {
      en: "Mavera 3, Kayashehir, Basaksehir, Istanbul",
      ar: "ماڤيرا 3، كاياشهر، باشاكشهر، إسطنبول",
    },
    description: {
      en: "A spacious 3.5+1 apartment on the ground floor of the Mavera 3 project in Kayashehir, Basaksehir — one of Istanbul's fastest-growing districts. The home offers 160 m² of total area with 126 m² of net usable space, a private garden, three bedrooms and a living room. Priced at 390,000 USD. Please note: this property is not eligible for Turkish citizenship through property investment.",
      ar: "شقة 3.5+1 واسعة في الطابق الأرضي من مشروع ماڤيرا 3 في كاياشهر، باشاكشهر — أحد أسرع أحياء إسطنبول نمواً. توفر الشقة مساحة إجمالية 160 م² بمساحة صافية 126 م²، مع حديقة خاصة وثلاث غرف نوم وصالة. السعر 390.000 دولار أمريكي. تنبيه: هذه العقار غير مناسب للحصول على الجنسية التركية عن طريق الاستثمار العقاري.",
    },
    amenities: ["garden"],
    images: maveraImages,
    agent: office,
  },
]

export const getProperty = (slug: string): Property | undefined =>
  properties.find((property) => property.slug === slug)

export const cityKeys = (): CityKey[] => Array.from(new Set(properties.map((p) => p.city)))
