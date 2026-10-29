import { Tajawal } from "next/font/google"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import type { Metadata } from "next"
import { Analytics } from "@/components/analytics"
import {
  directionOf,
  hasLocale,
  locales,
  type Locale,
} from "@/lib/i18n"
import "../globals.css"

export const metadata: Metadata = {
  icons: {
    icon: "/iskan-icon.png",
    shortcut: "/iskan-icon.png",
    apple: "/apple-touch-icon.png",
  },
  title: {
    default: "Iskan \u2014 Real Estate in Istanbul",
    template: "%s | Iskan",
  },
  description: "Discover luxury apartments, villas and offices across Istanbul's finest districts. Transparent pricing, verified listings.",
  metadataBase: new URL("https://iskantr.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "ar_TR",
    siteName: "Iskan",
    title: "Iskan \u2014 Real Estate in Istanbul",
    description: "Discover luxury apartments, villas and offices across Istanbul's finest districts.",
    images: ["/iskan-icon.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Iskan \u2014 Real Estate in Istanbul",
    description: "Discover luxury apartments, villas and offices across Istanbul's finest districts.",
    images: ["/iskan-icon.png"],
    creator: "@iskan",
  },
  verification: {
    google: "G-8YG8BYG8CJ",
  },
}

// One family for the whole site. Tajawal is geometric and carries real 800 and
// 900 weights, which the previous display face capped out at 700 — so headings
// that asked for extra weight were getting it faked by the browser.
//
// 600 is deliberately absent from the loaded set: Tajawal does not ship it.
// The code uses `font-semibold` in about 120 places and those land on 500,
// which is the closest real weight. Listing it here as a comment beats
// discovering it later as text that quietly looks lighter than intended.
const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800", "900"],
  // Stated rather than assumed: without it a slow connection can sit on
  // invisible text until the font finally lands.
  display: "swap",
})

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

  // Generated per request in proxy.ts; inline scripts must carry it.
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
      </head>
      <body className="flex min-h-dvh flex-col bg-sand-50 font-sans text-ink-900 antialiased">
        {children}
      </body>
    </html>
  )
}
