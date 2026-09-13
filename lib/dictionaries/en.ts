import type { Dictionary } from "./types"

const en = {
  brand: {
    name: "Iskan",
    officeName: "Iskan Real Estate",
    tagline: "Your trusted partner in real estate",
  },
  nav: {
    home: "Home",
    properties: "Properties",
    contact: "Contact",
  },
  hero: {
    badge: "The premier real estate destination",
    title1: "Looking for a property in the",
    titleHighlight: "perfect location?",
    title2: "",
    subtitle:
      "Discover the finest apartments, villas and offices across the region — transparent pricing and reliable service, 24/7.",
    searchButton: "Search",
    statProperties: "Listed properties",
    statCustomers: "Happy customers",
    statCities: "Cities covered",
    statYears: "Years of experience",
  },
  common: {
    forSale: "For Sale",
    forRent: "For Rent",
    beds: "beds",
    baths: "baths",
    area: "Area",
    sqm: "m²",
    perMonth: "/month",
    viewAll: "View all",
    results: "results",
    noResults: "No properties found",
    noResultsDesc:
      "Try adjusting your search criteria or clearing the filters to find the perfect match.",
    clearFilters: "Clear filters",
    searchButton: "Search",
    searchPlaceholder: "Search by city, name or district…",
    propertyType: "Property type",
    purpose: "Purpose",
    allTypes: "All types",
    allCities: "All cities",
    allPurposes: "All purposes",
    minPrice: "Min price",
    maxPrice: "Max price",
    sortBy: "Sort by",
    sortNewest: "Newest",
    sortPriceAsc: "Price: Low to High",
    sortPriceDesc: "Price: High to Low",
    features: "Features",
    amenities: "Amenities",
    description: "Description",
    agent: "Property consultant",
    phone: "Phone",
    email: "Email",
    callNow: "Call now",
    emailNow: "Send email",
    relatedProperties: "Similar properties",
    backToListings: "Back to listings",
    yearBuilt: "Year built",
    parking: "Parking spots",
    floor: "Floor",
    price: "Price",
    cityLabel: "City",
    properties: "properties",
    browseNow: "Browse",
    locationOnMap: "Location",
    all: "All",
    favorites: "Favorites",
    save: "Save",
    saved: "Saved",
    whatsapp: "WhatsApp",
  },
  sections: {
    featuredTitle: "Featured properties",
    featuredSubtitle:
      "A hand-picked selection of the finest available properties",
    browseTitle: "Browse by type",
    browseSubtitle: "Choose the property type that fits your lifestyle",
    whyTitle: "Why Iskan?",
    whySubtitle: "Service that exceeds expectations — quality you can trust",
    latestTitle: "Latest additions",
    latestSubtitle: "See the newest properties on the market",
    ctaTitle: "Have a property to sell or rent?",
    ctaSubtitle:
      "Our consultants are ready to evaluate your property and showcase it to thousands of buyers.",
    ctaButton: "Contact us",
    testimonialsTitle: "What our clients say",
    testimonialsSubtitle: "Trusted by hundreds of families and investors",
  },
  testimonials: {
    items: [
      {
        quote:
          "Iskan made buying our first home effortless. Every property was exactly as advertised, and the team guided us at every step.",
        name: "Omar R.",
        role: "Riyadh",
      },
      {
        quote:
          "Professional team, transparent process. They found renters for my unit in under two weeks.",
        name: "Lamia S.",
        role: "Dubai",
      },
      {
        quote:
          "Accurate listings and fast support saved me weeks of searching. Highly recommended!",
        name: "Yusuf K.",
        role: "Jeddah",
      },
    ],
  },
  why: {
    oneTitle: "Verified listings",
    oneDesc: "Every property is verified before it goes live.",
    twoTitle: "Deep expertise",
    twoDesc: "A team with over 15 years in the market.",
    threeTitle: "Transparent pricing",
    threeDesc: "No hidden fees, no surprises.",
    fourTitle: "24/7 support",
    fourDesc: "We are here whenever you need us.",
  },
  propertyTypes: {
    apartment: "Apartment",
    villa: "Villa",
    penthouse: "Penthouse",
    townhouse: "Townhouse",
    office: "Office",
    land: "Land",
  },
  propertyTypeDescriptions: {
    apartment: "Modern living in the heart of the city",
    villa: "Spacious homes with private outdoor space",
    penthouse: "Sky-high living with panoramic views",
    townhouse: "Comfortable multi-level family homes",
    office: "Professional workspaces that inspire",
    land: "Prime plots for your next development",
  },
  cities: {
    riyadh: "Riyadh",
    jeddah: "Jeddah",
    dammam: "Dammam",
    mecca: "Mecca",
    dubai: "Dubai",
    "abu-dhabi": "Abu Dhabi",
  },
  amenities: {
    pool: "Swimming pool",
    gym: "Fitness gym",
    parking: "Parking",
    garden: "Garden",
    security: "Security & CCTV",
    wifi: "High-speed wifi",
    elevator: "Elevator",
    balcony: "Balcony",
    furnished: "Fully furnished",
    centralAc: "Central A/C",
    kidsPlay: "Kids play area",
    smartHome: "Smart home",
  },
  footer: {
    aboutTitle: "About Iskan",
    about: "Iskan helps you find, buy and rent exceptional properties with transparent pricing and genuine care.",
    quickLinks: "Quick links",
    contactTitle: "Contact",
    rights: "All rights reserved",
    madeWith: "Iskan",
    exploreTitle: "Explore",
    legalTitle: "Legal",
    privacy: "Privacy Policy",
    cookies: "Cookie Policy",
    backHome: "Back to home",
  },
  legal: {
    privacyTitle: "Privacy Policy",
    privacyIntro:
      "This Privacy Policy explains how Iskan Real Estate collects, uses, stores and protects your personal information when you use our website and services.",
    privacyDate: "Last updated: September 2026",
    privacySections: [
      {
        heading: "1. Information we collect",
        body: "We may collect information you provide directly, such as your name, phone number, email address and any message you send when contacting us or requesting a property valuation. We also collect basic technical data automatically, including your browser type, device, IP address and pages you visit, to help us improve our website.",
      },
      {
        heading: "2. How we use your information",
        body: "Your information is used to respond to your enquiries, send you property listings that match your interests, improve our services, and meet our legal obligations. We do not sell your personal data to third parties.",
      },
      {
        heading: "3. Sharing your information",
        body: "We only share your data with trusted service providers who help us operate our website (such as hosting and analytics), and only to the extent necessary to provide our services. Any enquiries you make about a specific property may be shared with the relevant property consultant.",
      },
      {
        heading: "4. Data retention and security",
        body: "We keep your personal data for as long as necessary to provide our services or as required by law. We apply appropriate technical and organisational measures to protect your information from unauthorised access, loss or misuse.",
      },
      {
        heading: "5. Your rights",
        body: "You have the right to access, correct or delete the personal data we hold about you. To exercise these rights, or if you have any concerns about your privacy, please contact us through the details on this website.",
      },
    ],
    cookiesTitle: "Cookie Policy",
    cookiesIntro:
      "This Cookie Policy explains what cookies are, how Iskan Real Estate uses them, and how you can control them on our website.",
    cookiesDate: "Last updated: September 2026",
    cookiesSections: [
      {
        heading: "1. What are cookies?",
        body: "Cookies are small text files stored on your device when you visit a website. They help the website remember your preferences and improve your browsing experience.",
      },
      {
        heading: "2. Cookies we use",
        body: "We use essential cookies required for the website to function, such as remembering your preferred language. We also use analytics cookies to understand how visitors use the site so we can make it better, and optional cookies to power interactive features like your favorites list.",
      },
      {
        heading: "3. Managing cookies",
        body: "You can control or delete cookies through your browser settings at any time. Please note that disabling essential cookies may affect how the website works. Your favorites list is stored locally in your browser.",
      },
      {
        heading: "4. Third-party cookies",
        body: "Parts of our website may load content from third-party services (such as image hosting and website analytics). These services may set their own cookies, which are governed by their respective privacy policies.",
      },
      {
        heading: "5. Changes to this policy",
        body: "We may update this Cookie Policy from time to time. Any changes will be published on this page with a new 'last updated' date.",
      },
    ],
  },
  meta: {
    homeTitle: "Iskan — Your property in the perfect location",
    homeDescription:
      "Discover apartments, villas, penthouses and offices across Riyadh, Jeddah, Dubai and more. Transparent pricing, verified listings.",
    propertiesTitle: "All properties — Iskan",
    propertiesDescription:
      "Browse our full catalog of apartments, villas, offices and land for sale and rent.",
    privacyTitle: "Privacy Policy — Iskan",
    privacyDescription:
      "How Iskan Real Estate collects, uses and protects your personal information.",
    cookiesTitle: "Cookie Policy — Iskan",
    cookiesDescription:
      "What cookies Iskan uses and how you can control them.",
  },
} satisfies Dictionary

export default en