import { notFound } from "next/navigation"
import { LegalPage } from "@/components/legal-page"
import { getDictionary, hasLocale } from "@/lib/i18n"

type PageProps = {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params
  const locale = hasLocale(lang) ? lang : "ar"
  const dict = await getDictionary(locale)
  return {
    title: dict.meta.privacyTitle,
    description: dict.meta.privacyDescription,
  }
}

export default async function PrivacyPage({ params }: PageProps) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: "ar" | "en" = lang
  const dict = await getDictionary(locale)
  return <LegalPage locale={locale} dict={dict} kind="privacy" />
}