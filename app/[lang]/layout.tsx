import { Cairo } from "next/font/google"
import { notFound } from "next/navigation"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import {
  directionOf,
  getDictionary,
  hasLocale,
  locales,
  type Locale,
} from "@/lib/i18n"
import "../globals.css"

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
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

  const dict = await getDictionary(locale)

  return (
    <html lang={lang} dir={directionOf(locale)} className={cairo.variable}>
      <body className="flex min-h-dvh flex-col bg-sand-50 font-sans text-ink-900 antialiased">
        <SiteHeader locale={locale} dict={dict} />
        <main className="flex-1 pt-16">{children}</main>
        <SiteFooter locale={locale} dict={dict} />
      </body>
    </html>
  )
}