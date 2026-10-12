import { Cairo, El_Messiri } from "next/font/google"
import { notFound } from "next/navigation"
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
    google: "G-G8H7V5Q24S",
  },
}

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
})

// Display face for headings — a warmer, humanist counterpart to Cairo.
const messiri = El_Messiri({
  variable: "--font-messiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
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

  return (
    <html
      lang={lang}
      dir={directionOf(locale)}
      className={`${cairo.variable} ${messiri.variable}`}
    >
      <head>
        <Analytics />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body className="flex min-h-dvh flex-col bg-sand-50 font-sans text-ink-900 antialiased">
        {children}
      </body>
    </html>
  )
}
