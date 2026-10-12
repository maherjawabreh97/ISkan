import Link from "next/link"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { ListingsView } from "@/components/listings-view"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"
import { getProperties } from "@/lib/properties-store"

export const dynamic = "force-dynamic"

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
  const properties = await getProperties()

  return (
    <>
      <section className="relative overflow-hidden bg-ink-950 py-10 text-white lg:py-12">
        <div className="bg-grid-dark absolute inset-0 opacity-30" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <nav className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
            <Link href={`/${locale}`} className="transition hover:text-white">
              {dict.nav.home}
            </Link>
            <ChevronRight className="size-3 rtl:hidden" />
            <ChevronLeft className="size-3 ltr:hidden" />
            <span className="text-gold-300">{dict.nav.properties}</span>
          </nav>
          <h1 className="mt-3 font-heading text-2xl font-bold sm:text-3xl">
            {dict.nav.properties}
          </h1>
          <p className="mt-1.5 text-sm font-medium text-white/50">
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

      <section className="pb-16 lg:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 rounded-[2rem] bg-gradient-to-br from-brand-900 via-ink-900 to-ink-950 px-6 py-10 text-center text-white sm:flex-row sm:text-start sm:px-10">
            <div>
              <h2 className="text-2xl font-black">{dict.submit.title}</h2>
              <p className="mt-2 max-w-xl text-sm font-semibold leading-relaxed text-white/70">
                {dict.submit.subtitle}
              </p>
            </div>
            <Link
              href={`/${locale}/submit`}
              className="btn-gold inline-flex shrink-0 items-center gap-2 rounded-full px-7 py-3.5 text-sm font-extrabold"
            >
              <Plus className="size-4" />
              {dict.nav.submit}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}