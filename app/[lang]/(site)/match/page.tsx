import Link from "next/link"
import { notFound } from "next/navigation"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"
import { PropertyMatch } from "@/components/property-match"

export const dynamic = "force-dynamic"

export default async function MatchPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const isAr = locale === "ar"
  const dict = await getDictionary(locale)

  return (
    <section className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
      <span className="block h-px w-7 bg-gold-500" />
      <h1 className="mt-4 font-heading text-2xl font-bold text-ink-900 sm:text-3xl">
        {isAr ? "ابحث عن عقار يناسبك" : "Find a property that suits you"}
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-7 text-slate-600">
        {isAr
          ? "أجب عن ثلاثة أسئلة سريعة وسنعرض لك العقارات المناسبة خلال 30 ثانية."
          : "Answer three quick questions and we will show you the matching properties in 30 seconds."}
      </p>

      <div className="mt-8">
        <PropertyMatch locale={locale} dict={dict} />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={`/${locale}/properties`}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-bold text-ink-900 transition hover:border-brand-400"
        >
          {isAr ? "تصفح كل العقارات" : "Browse all properties"}
        </Link>
        <Link
          href={`/${locale}/calculator`}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-bold text-ink-900 transition hover:border-brand-400"
        >
          {isAr ? "حاسبة الاستثمار" : "Investment calculator"}
        </Link>
      </div>
    </section>
  )
}
