import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"
import { getProperties } from "@/lib/properties-store"
import { COMPARE_MAX } from "@/lib/compare"
import { CompareView } from "@/components/compare-view"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ slugs?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params
  const locale = hasLocale(lang) ? lang : "ar"
  const dict = await getDictionary(locale)
  const title =
    locale === "ar"
      ? "مقارنة العقارات في إسطنبول"
      : "Compare Istanbul properties"
  const description =
    locale === "ar"
      ? "قارن حتى 4 عقارات في إسطنبول جنباً إلى جنب: السعر، سعر المتر المربع، المساحة، غرف النوم، المميزات والمرافق — بشكل واضح."
      : "Compare up to 4 Istanbul listings side by side: price, price per m², area, bedrooms, features and amenities — clearly."

  return {
    title: `${title} — ${dict.brand.name}`,
    description,
    alternates: {
      canonical: `https://iskantr.com/${locale}/compare`,
      languages: {
        ar: "https://iskantr.com/ar/compare",
        en: "https://iskantr.com/en/compare",
      },
    },
    openGraph: {
      title,
      description,
      url: `https://iskantr.com/${locale}/compare`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  }
}

export default async function ComparePage({ params, searchParams }: PageProps) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const dict = await getDictionary(locale)
  const query = await searchParams

  const initialSlugs = (query.slugs ?? "")
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean)
    .slice(0, COMPARE_MAX)

  const properties = await getProperties()

  return (
    <CompareView
      locale={locale}
      dict={dict}
      properties={properties}
      initialSlugs={initialSlugs}
    />
  )
}
