import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { LegalPage } from "@/components/legal-page"
import { listingRules } from "@/lib/dictionaries/legal-extra"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"

type PageProps = {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params
  const locale: Locale = hasLocale(lang) ? lang : "ar"
  return { title: listingRules[locale].title }
}

export default async function ListingRulesPage({ params }: PageProps) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const dict = await getDictionary(locale)
  return <LegalPage locale={locale} dict={dict} kind="rules" />
}