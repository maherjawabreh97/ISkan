import Link from "next/link"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ListingsView } from "@/components/listings-view"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"
import { properties } from "@/lib/properties"

type PageProps = {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params
  const locale = hasLocale(lang) ? lang : "ar"
  const dict = await getDictionary(locale)
  return {
    title: dict.meta.propertiesTitle,
    description: dict.meta.propertiesDescription,
  }
}

export default async function PropertiesPage({ params }: PageProps) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const dict = await getDictionary(locale)

  return (
    <>
      <section className="relative overflow-hidden bg-ink-950 py-16 text-white lg:py-20">
        <div className="bg-grid-dark absolute inset-0 opacity-50" />
        <div className="absolute -start-24 top-0 size-72 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="absolute -end-20 bottom-0 size-72 rounded-full bg-gold-500/15 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs font-bold text-white/50">
            <Link href={`/${locale}`} className="transition hover:text-white">
              {dict.nav.home}
            </Link>
            <ChevronRight className="size-3.5 rtl:hidden" />
            <ChevronLeft className="size-3.5 ltr:hidden" />
            <span className="text-gold-300">{dict.nav.properties}</span>
          </nav>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl lg:text-5xl">
            {dict.nav.properties}
          </h1>
          <p className="mt-2 text-sm font-bold text-white/50">
            {properties.length} {dict.common.results}
          </p>
        </div>
      </section>

      <section className="py-10 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Suspense
            fallback={
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-96 animate-pulse rounded-3xl bg-slate-200/70"
                  />
                ))}
              </div>
            }
          >
            <ListingsView locale={locale} dict={dict} allProperties={properties} />
          </Suspense>
        </div>
      </section>
    </>
  )
}