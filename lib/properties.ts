import type {
  AmenityKey,
  CityKey,
  LocalizedString,
  PropertyTypeKey,
  PurposeKey,
} from "./dictionaries/types"

export interface Property {
  slug: string
  type: PropertyTypeKey
  purpose: PurposeKey
  price: number
  pricePerMonth?: boolean
  area: number
  bedrooms: number
  bathrooms: number
  parking: number
  yearBuilt: number
  floor?: number
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

const img = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

const IMG = {
  poolVilla: img("photo-1613490493576-7fde63acd811"),
  luxuryHome: img("photo-1512917774080-9991f1c4c750"),
  houseDusk: img("photo-1600596542815-ffad4c1539a9"),
  modernHouse: img("photo-1600585154340-be6161a56a0c"),
  whiteVilla: img("photo-1560518883-ce09059eeffa"),
  greenVilla: img("photo-1600047509807-ba8f99d2cdde"),
  greyVilla: img("photo-1580587771525-78b9dba3b914"),
  gardenVilla: img("photo-1583608205776-bfd35f0d9f83"),
  poolHouse: img("photo-1570129477492-45c003edd2be"),
  nightVilla: img("photo-1600210492486-724fe5c67fb0"),
  classicVilla: img("photo-1564013799919-ab600027ffc6"),
  whiteModern: img("photo-1523217582562-09d0def993a6"),
  livingWarm: img("photo-1600607687939-ce8a6c25118c"),
  livingBright: img("photo-1600121848594-d8644e57abab"),
  apartmentLiving: img("photo-1502672260266-1c1ef2d93688"),
  apartmentInterior: img("photo-1560448204-e02f11c3d0e2"),
  livingGrey: img("photo-1586023492125-27b2c045efd7"),
  kitchen: img("photo-1600585154526-990dced4db0d"),
  officeExterior: img("photo-1486406146926-c627a92ad1ab"),
  officeInterior: img("photo-1497366754035-f200968a6e72"),
  officeLobby: img("photo-1517502884422-41eaead166d4"),
  officeDesks: img("photo-1524758631624-e2822e304c36"),
  aptBuilding: img("photo-1545324418-cc1a3fa10c00"),
  beachVilla: img("photo-1577495508048-b635879837f1"),
  cityTower: img("photo-1479839672679-a46483c0e7c8"),
}

export const properties: Property[] = [
  {
    slug: "rawdah-garden-villa",
    type: "villa",
    purpose: "sale",
    price: 1250000,
    area: 420,
    bedrooms: 5,
    bathrooms: 6,
    parking: 4,
    yearBuilt: 2022,
    floor: 2,
    city: "riyadh",
    featured: true,
    dateAdded: "2026-06-12",
    name: {
      en: "Rawdah Garden Villa",
      ar: "فيلا الروضة جاردن",
    },
    address: {
      en: "Al Narjis, Riyadh",
      ar: "حي النرجس، الرياض",
    },
    description: {
      en: "A luxurious two-storey villa in the heart of Riyadh with a private garden, swimming pool and a spacious majlis. Finished with premium materials and smart-home automation throughout.",
      ar: "فيلا فاخرة من طابقين في قلب الرياض مع حديقة خاصة ومسبح ومجلس واسع. مشطّبة بخامات راقية مع أنظمة منزل ذكي في كامل الفيلا.",
    },
    amenities: ["pool", "garden", "security", "centralAc", "smartHome", "parking", "furnished"],
    images: [IMG.greenVilla, IMG.livingWarm, IMG.nightVilla],
    agent: {
      name: { en: "Khalid Al-Otaibi", ar: "خالد العتيبي" },
      role: "senior-consultant",
      phone: "+966551234001",
      email: "khalid@arakan-estate.com",
    },
  },
  {
    slug: "marina-sky-apartment",
    type: "apartment",
    purpose: "rent",
    price: 4500,
    pricePerMonth: true,
    area: 110,
    bedrooms: 2,
    bathrooms: 2,
    parking: 1,
    yearBuilt: 2021,
    floor: 24,
    city: "dubai",
    featured: true,
    dateAdded: "2026-07-02",
    name: {
      en: "Marina Sky Residence",
      ar: "شقة مارينا سكاي",
    },
    address: {
      en: "Dubai Marina, Dubai",
      ar: "مرسى دبي، دبي",
    },
    description: {
      en: "A stunning high-floor apartment overlooking Dubai Marina with floor-to-ceiling windows, a fully equipped gym, infinity pool and world-class amenities.",
      ar: "شقة راقية في دور علوي تطل على مرسى دبي بنوافذ ممتدة من الأرض للسقف، نادٍ رياضي متكامل ومسبح إنفينيتي ومرافق عالمية المستوى.",
    },
    amenities: ["pool", "gym", "security", "wifi", "elevator", "balcony", "centralAc"],
    images: [IMG.apartmentLiving, IMG.apartmentInterior, IMG.cityTower],
    agent: {
      name: { en: "Sara Al-Shammari", ar: "سارة الشمري" },
      role: "property-manager",
      phone: "+966551234002",
      email: "sara@arakan-estate.com",
    },
  },
  {
    slug: "jeddah-seafront-penthouse",
    type: "penthouse",
    purpose: "sale",
    price: 2100000,
    area: 320,
    bedrooms: 4,
    bathrooms: 5,
    parking: 3,
    yearBuilt: 2020,
    floor: 14,
    city: "jeddah",
    featured: true,
    dateAdded: "2026-05-20",
    name: {
      en: "Jeddah Seafront Penthouse",
      ar: "بنتهاوس جدة الشاطئي",
    },
    address: {
      en: "Corniche, Jeddah",
      ar: "الكورنيش، جدة",
    },
    description: {
      en: "An exceptional seafront penthouse with panoramic Red Sea views, private terrace and high-end finishes. A rare opportunity on Jeddah's Corniche.",
      ar: "بنتهاوس استثنائي على البحر بإطلالات بانورامية على البحر الأحمر وتراس خاص وتشطيبات فاخرة. فرصة نادرة على كورنيش جدة.",
    },
    amenities: ["pool", "gym", "security", "balcony", "furnished", "elevator", "smartHome"],
    images: [IMG.beachVilla, IMG.livingBright, IMG.poolHouse],
    agent: {
      name: { en: "Mohammed Al-Harbi", ar: "محمد الحربي" },
      role: "senior-consultant",
      phone: "+966551234003",
      email: "mohammed@arakan-estate.com",
    },
  },
  {
    slug: "business-bay-office",
    type: "office",
    purpose: "rent",
    price: 2800,
    pricePerMonth: true,
    area: 180,
    bedrooms: 0,
    bathrooms: 2,
    parking: 2,
    yearBuilt: 2023,
    floor: 7,
    city: "riyadh",
    featured: false,
    dateAdded: "2026-08-05",
    name: {
      en: "Business Bay Office",
      ar: "مكتب بيزنس باي",
    },
    address: {
      en: "King Abdullah Financial District, Riyadh",
      ar: "حي المال، الرياض",
    },
    description: {
      en: "A modern serviced office in the King Abdullah Financial District, fully fitted with meeting rooms, reception and high-speed connectivity.",
      ar: "مكتب عصري بخدمات متكاملة في حي المال، مجهز بالكامل بقاعات اجتماعات واستقبال واتصال فائق السرعة.",
    },
    amenities: ["security", "wifi", "elevator", "centralAc", "parking"],
    images: [IMG.officeInterior, IMG.officeDesks, IMG.officeExterior],
    agent: {
      name: { en: "Noura Al-Shehri", ar: "نورة الشهري" },
      role: "commercial-advisor",
      phone: "+966551234004",
      email: "noura@arakan-estate.com",
    },
  },
  {
    slug: "emirates-hills-estate",
    type: "villa",
    purpose: "sale",
    price: 3750000,
    area: 600,
    bedrooms: 6,
    bathrooms: 7,
    parking: 6,
    yearBuilt: 2021,
    floor: 2,
    city: "dubai",
    featured: true,
    dateAdded: "2026-09-01",
    name: {
      en: "Emirates Hills Estate",
      ar: "فيلا إمارات هيلز",
    },
    address: {
      en: "Emirates Hills, Dubai",
      ar: "إمارات هيلز، دبي",
    },
    description: {
      en: "A magnificent estate in the exclusive Emirates Hills community with landscaped gardens, a resort-style pool and panoramic golf-course views.",
      ar: "فيلا مهيبة في مجتمع إمارات هيلز الحصري مع حدائق منسقة ومسبح بأسلوب المنتجعات وإطلالات على ملعب الجولف.",
    },
    amenities: ["pool", "garden", "gym", "security", "smartHome", "centralAc", "kidsPlay"],
    images: [IMG.poolVilla, IMG.luxuryHome, IMG.classicVilla],
    agent: {
      name: { en: "Ahmed Al-Qahtani", ar: "أحمد القحطاني" },
      role: "luxury-consultant",
      phone: "+966551234005",
      email: "ahmed@arakan-estate.com",
    },
  },
  {
    slug: "al-noor-apartments",
    type: "apartment",
    purpose: "rent",
    price: 1900,
    pricePerMonth: true,
    area: 95,
    bedrooms: 2,
    bathrooms: 2,
    parking: 1,
    yearBuilt: 2019,
    floor: 5,
    city: "mecca",
    featured: false,
    dateAdded: "2026-04-18",
    name: {
      en: "Al Noor Residency",
      ar: "شقق النور",
    },
    address: {
      en: "Al Aziziyah, Mecca",
      ar: "العزيزية، مكة المكرمة",
    },
    description: {
      en: "A comfortable family apartment close to the Holy Mosque with easy access, secure building and a lovely community atmosphere.",
      ar: "شقة عائلية مريحة قريبة من الحرم المكي مع سهولة الوصول ومبنى آمن وأجواء مجتمعية مميزة.",
    },
    amenities: ["security", "wifi", "elevator", "centralAc", "parking", "furnished"],
    images: [IMG.whiteModern, IMG.livingGrey, IMG.aptBuilding],
    agent: {
      name: { en: "Abdullah Al-Malki", ar: "عبدالله المالكي" },
      role: "property-manager",
      phone: "+966551234006",
      email: "abdullah@arakan-estate.com",
    },
  },
  {
    slug: "corniche-townhouse",
    type: "townhouse",
    purpose: "sale",
    price: 480000,
    area: 240,
    bedrooms: 4,
    bathrooms: 4,
    parking: 2,
    yearBuilt: 2022,
    floor: 3,
    city: "dammam",
    featured: false,
    dateAdded: "2026-06-25",
    name: {
      en: "Corniche Townhouse",
      ar: "تاون هاوس الكورنيش",
    },
    address: {
      en: "Al Shatea District, Dammam",
      ar: "حي الشاطئ، الدمام",
    },
    description: {
      en: "A bright three-level townhouse minutes from Dammam's Corniche, with a private courtyard and a modern open-plan layout.",
      ar: "تاون هاوس مشرق من ثلاثة طوابق على بعد دقائق من كورنيش الدمام، مع فناء خاص وتصميم عصري مفتوح.",
    },
    amenities: ["garden", "parking", "security", "balcony", "centralAc"],
    images: [IMG.gardenVilla, IMG.kitchen, IMG.houseDusk],
    agent: {
      name: { en: "Fahad Al-Dossari", ar: "فهد الدوسري" },
      role: "senior-consultant",
      phone: "+966551234007",
      email: "fahad@arakan-estate.com",
    },
  },
  {
    slug: "capital-plot-abu-dhabi",
    type: "land",
    purpose: "sale",
    price: 650000,
    area: 800,
    bedrooms: 0,
    bathrooms: 0,
    parking: 0,
    yearBuilt: 2023,
    city: "abu-dhabi",
    featured: false,
    dateAdded: "2026-03-10",
    name: {
      en: "Capital Corner Plot",
      ar: "أرض العاصمة الزاوية",
    },
    address: {
      en: "Al Reem Island, Abu Dhabi",
      ar: "جزيرة الريم، أبوظبي",
    },
    description: {
      en: "A prime corner plot on Al Reem Island, ready for immediate development and zoned for residential use in one of Abu Dhabi's most vibrant districts.",
      ar: "أرض زاوية مميزة في جزيرة الريم جاهزة للتطوير الفوري، مخصصة للاستخدام السكني في أحد أرقى أحياء أبوظبي.",
    },
    amenities: ["security"],
    images: [IMG.cityTower, IMG.officeExterior, IMG.aptBuilding],
    agent: {
      name: { en: "Layla Al-Rashidi", ar: "ليلى الرشيدي" },
      role: "land-specialist",
      phone: "+966551234008",
      email: "layla@arakan-estate.com",
    },
  },
  {
    slug: "reem-tower-residence",
    type: "apartment",
    purpose: "sale",
    price: 890000,
    area: 130,
    bedrooms: 3,
    bathrooms: 3,
    parking: 2,
    yearBuilt: 2022,
    floor: 18,
    city: "abu-dhabi",
    featured: false,
    dateAdded: "2026-07-22",
    name: {
      en: "Reem Tower Residence",
      ar: "شقة ريم تاور",
    },
    address: {
      en: "Al Reem Island, Abu Dhabi",
      ar: "جزيرة الريم، أبوظبي",
    },
    description: {
      en: "A contemporary three-bedroom apartment in a landmark tower, featuring water views, premium amenities and a smart access system.",
      ar: "شقة عصرية من ثلاث غرف نوم في برج أيقوني مع إطلالات بحرية ومرافق فاخرة ونظام دخول ذكي.",
    },
    amenities: ["pool", "gym", "security", "elevator", "balcony", "smartHome"],
    images: [IMG.modernHouse, IMG.livingWarm, IMG.cityTower],
    agent: {
      name: { en: "Omar Al-Ghamdi", ar: "عمر الغامدي" },
      role: "residential-advisor",
      phone: "+966551234009",
      email: "omar@arakan-estate.com",
    },
  },
  {
    slug: "skyline-penthouse-dubai",
    type: "penthouse",
    purpose: "rent",
    price: 12000,
    pricePerMonth: true,
    area: 350,
    bedrooms: 4,
    bathrooms: 5,
    parking: 3,
    yearBuilt: 2023,
    floor: 52,
    city: "dubai",
    featured: true,
    dateAdded: "2026-08-30",
    name: {
      en: "Skyline Penthouse",
      ar: "بنتهاوس سكايلاين",
    },
    address: {
      en: "Downtown Dubai, Dubai",
      ar: "داونتاون دبي، دبي",
    },
    description: {
      en: "A breath-taking penthouse above Downtown Dubai with direct Burj Khalifa views, private lifts and an entertainer's terrace.",
      ar: "بنتهاوس يخطف الأنظار فوق وسط دبي مع إطلالة مباشرة على برج خليفة ومصاعد خاصة وتراس للضيوف.",
    },
    amenities: ["pool", "gym", "security", "furnished", "elevator", "smartHome", "balcony"],
    images: [IMG.cityTower, IMG.livingBright, IMG.luxuryHome],
    agent: {
      name: { en: "Fatima Al-Zahrani", ar: "فاطمة الزهراني" },
      role: "luxury-consultant",
      phone: "+966551234010",
      email: "fatima@arakan-estate.com",
    },
  },
  {
    slug: "dana-garden-villa",
    type: "villa",
    purpose: "sale",
    price: 720000,
    area: 380,
    bedrooms: 5,
    bathrooms: 4,
    parking: 3,
    yearBuilt: 2020,
    floor: 2,
    city: "dammam",
    featured: false,
    dateAdded: "2026-05-14",
    name: {
      en: "Dana Garden Villa",
      ar: "فيلا دانا جاردن",
    },
    address: {
      en: "Al Faisaliyah, Dammam",
      ar: "حي الفيصلية، الدمام",
    },
    description: {
      en: "A well-maintained family villa with a large garden, double garage and generous living spaces, ideal for growing families.",
      ar: "فيلا عائلية جيدة الصيانة مع حديقة كبيرة ومواقف سيارة وعيشة واسعة، مثالية للعائلات المتنامية.",
    },
    amenities: ["garden", "parking", "security", "centralAc", "kidsPlay"],
    images: [IMG.poolHouse, IMG.livingGrey, IMG.gardenVilla],
    agent: {
      name: { en: "Bandar Al-Otaibi", ar: "بندر العتيبي" },
      role: "senior-consultant",
      phone: "+966551234011",
      email: "bandar@arakan-estate.com",
    },
  },
  {
    slug: "difc-executive-suite",
    type: "office",
    purpose: "rent",
    price: 5500,
    pricePerMonth: true,
    area: 210,
    bedrooms: 0,
    bathrooms: 2,
    parking: 3,
    yearBuilt: 2023,
    floor: 9,
    city: "dubai",
    featured: false,
    dateAdded: "2026-09-08",
    name: {
      en: "DIFC Executive Suite",
      ar: "مكتب سوق دبي المالي التنفيذي",
    },
    address: {
      en: "DIFC, Dubai",
      ar: "سوق دبي المالي، دبي",
    },
    description: {
      en: "A prestigious executive office in the heart of DIFC with boutique finishes, boardroom, pantry and premium building services.",
      ar: "مكتب تنفيذي مرموق في قلب سوق دبي المالي بتشطيبات راقية وغرفة مجالس ومطبخ تحضير وخدمات مبنى مميزة.",
    },
    amenities: ["security", "wifi", "elevator", "centralAc", "parking", "gym"],
    images: [IMG.officeLobby, IMG.officeInterior, IMG.officeExterior],
    agent: {
      name: { en: "Hind Al-Qassim", ar: "هند القاسم" },
      role: "commercial-advisor",
      phone: "+966551234012",
      email: "hind@arakan-estate.com",
    },
  },
]

export const getProperty = (slug: string): Property | undefined =>
  properties.find((property) => property.slug === slug)

export const cityKeys = (): CityKey[] => Array.from(new Set(properties.map((p) => p.city)))