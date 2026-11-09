import { Tajawal } from "next/font/google"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import type { Metadata } from "next"
import { Analytics } from "@/components/analytics"
import { AppToaster } from "@/components/app-toaster"
import {
  directionOf,
  hasLocale,
  locales,
  type Locale,
} from "@/lib/i18n"
import { getDictionary } from "@/lib/i18n"
import "../globals.css"

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800", "900"],
  display: "swap",
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const locale = hasLocale(lang) ? lang : "ar"
  const dict = await getDictionary(locale)
  const isAr = locale === "ar"

  const title = isAr
    ? "إسكان — عقارات للبيع وإيجار في إسطنبول | شقق، فلل، مكاتب"
    : "Iskan — Real Estate for Sale & Rent in Istanbul | Apartments, Villas, Offices"

  const description = isAr
    ? "اكتشف أفضل العقارات في إسطنبول — شقق، فلل، بنتهاوس، مكاتب وأراضي للبيع والإيجار. أسعار شفافة، إدراجات موثقة، استشارات عقارية احترافية. مكتب إسكان العقاري."
    : "Discover premium real estate in Istanbul — apartments, villas, penthouses, offices and land for sale and rent. Transparent pricing, verified listings, professional real estate consultancy. Iskan Real Estate."

  const keywords = isAr
    ? [
        "عقارات إسطنبول",
        "شقق للبيع إسطنبول",
        "فلل إسطنبول",
        "بنتهاوس إسطنبول",
        "مكاتب إسطنبول",
        "أراضي إسطنبول",
        "إيجار شقق إسطنبول",
        "عقارات تركيا",
        "شراء عقار إسطنبول",
        "مكتب عقاري إسطنبول",
        "عقارات باشاكشهر",
        "عقارات كاياشهر",
        "استثمار عقاري إسطنبول",
        "جنسية تركية عقار",
        "استشارات عقارية",
      ]
    : [
        "real estate Istanbul",
        "apartments for sale Istanbul",
        "villas Istanbul",
        "penthouses Istanbul",
        "offices Istanbul",
        "land for sale Istanbul",
        "rent apartment Istanbul",
        "property Turkey",
        "buy property Istanbul",
        "real estate agency Istanbul",
        "Istanbul property investment",
        "Turkish citizenship by investment",
        "Basaksehir real estate",
        "Kayashehir properties",
        "Istanbul apartments sale",
        "rental properties Istanbul",
      ]

  return {
    title: {
      default: title,
      template: "%s | Iskan Real Estate",
    },
    description,
    keywords,
    metadataBase: new URL("https://iskantr.com"),
    alternates: {
      canonical: `https://iskantr.com/${locale}`,
      languages: {
        ar: "https://iskantr.com/ar",
        en: "https://iskantr.com/en",
      },
    },
    openGraph: {
      type: "website",
      locale: isAr ? "ar_TR" : "en_US",
      alternateLocale: isAr ? "en_US" : "ar_TR",
      siteName: "Iskan Real Estate",
      title,
      description,
      url: `https://iskantr.com/${locale}`,
      images: [
        {
          url: "/iskan-icon.png",
          width: 1200,
          height: 630,
          alt: isAr ? "إسكان — عقارات في إسطنبول" : "Iskan — Real Estate in Istanbul",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/iskan-icon.png"],
      creator: "@iskanrealestate",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "G-3WMHLEHJLK",
    },
  }
}

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang

  const nonce = (await headers()).get("x-nonce") ?? undefined

  return (
    <html
      lang={lang}
      dir={directionOf(locale)}
      className={tajawal.variable}
    >
      <head>
        <Analytics nonce={nonce} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        {/* Structured data for search engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              name: "Iskan Real Estate",
              url: "https://iskantr.com",
              logo: "https://iskantr.com/iskan-icon.png",
              description: locale === "ar"
                ? "مكتب إسكان العقاري — عقارات للبيع وإيجار في إسطنبول"
                : "Iskan Real Estate — properties for sale and rent in Istanbul",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Istanbul",
                addressCountry: "TR",
              },
              telephone: "+905432466309",
              email: "Iskanrealestatetr@gmail.com",
              areaServed: {
                "@type": "City",
                name: "Istanbul",
              },
              sameAs: [],
            }),
          }}
        />
      </head>
      <body className="flex min-h-dvh flex-col bg-sand-50 font-sans text-ink-900 antialiased">
        {children}
        <AppToaster />
      </body>
    </html>
  )
}