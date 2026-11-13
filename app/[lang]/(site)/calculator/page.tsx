import Link from "next/link"
import { notFound } from "next/navigation"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"
import { InvestmentCalculator } from "@/components/investment-calculator"

export const dynamic = "force-dynamic"

export default async function CalculatorPage({
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
    <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <span className="block h-px w-7 bg-gold-500" />
      <h1 className="mt-4 font-heading text-2xl font-bold text-ink-900 sm:text-3xl">
        {isAr ? "حاسبة الاستثمار العقاري" : "Property investment calculator"}
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-7 text-slate-600">
        {isAr
          ? "احسب الدفعة الشهرية، العائد الإيجاري، وفترة استرداد رأس المال قبل أن تقرر."
          : "Work out the monthly payment, rental yield and payback period before you decide."}
      </p>

      <div className="mt-8">
        <InvestmentCalculator locale={locale} />
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href={`/${locale}/properties`}
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          {dict.nav.properties}
        </Link>
        <Link
          href={`/${locale}/market`}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-bold text-ink-900 transition hover:border-brand-400"
        >
          {isAr ? "مؤشرات السوق" : "Market insights"}
        </Link>
      </div>
    </section>
  )
}
