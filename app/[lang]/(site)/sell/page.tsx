import Link from "next/link"
import { notFound } from "next/navigation"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"

export const dynamic = "force-dynamic"

export default async function SellPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const isAr = locale === "ar"
  const dict = await getDictionary(locale)

  const steps = isAr
    ? [
        "أرسل تفاصيل عقارك (صور، مساحة، سعر).",
        "نقوم بتقييم العقار وتحديد سعر بيع مقترح.",
        "نشر الإعلان على الموقع + قنواتنا.",
        "استقبال عروض من مشترين مهتمين.",
        "مرافقة في التفاوض والعقد ونقل الملكية (Tapu).",
      ]
    : [
        "Send your property details (photos, area, price).",
        "We appraise the property and propose a listing price.",
        "We publish the listing on the site + our channels.",
        "Receive offers from interested buyers.",
        "We accompany negotiation, contract and title deed (Tapu) transfer.",
      ]

  return (
    <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      <span className="block h-px w-7 bg-gold-500" />
      <h1 className="mt-4 font-heading text-2xl font-bold text-ink-900 sm:text-3xl">
        {isAr ? "بع عقارك مع إسكان" : "Sell your property with Iskan"}
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-7 text-slate-600">
        {isAr
          ? "نبيع عقارك بأفضل سعر وأسرع وقت — مع خدمة احترافية من التقييم حتى تسليم المفاتيح."
          : "We sell your property at the best price and fastest time — professional service from appraisal to key handover."}
      </p>

      <div className="mt-8 rounded-2xl bg-sand-50 p-6 ring-1 ring-slate-200/70">
        <h2 className="font-heading text-lg font-bold text-ink-900">
          {isAr ? "كيف نعمل" : "How it works"}
        </h2>
        <ol className="mt-4 space-y-2">
          {steps.map((s, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {(isAr
          ? [
              { t: "تقييم مجاني", d: "تقييم عقارك بدون التزام." },
              { t: "تسويق واسع", d: "عرض على موقعنا + قنواتنا." },
              { t: "مرافقة كاملة", d: "من التفاوض إلى Tapu." },
            ]
          : [
              { t: "Free appraisal", d: "Appraise your property with no obligation." },
              { t: "Wide marketing", d: "Listed on our site + our channels." },
              { t: "Full accompaniment", d: "From negotiation to Tapu." },
            ]
        ).map((b, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70"
          >
            <h3 className="font-heading text-base font-bold text-ink-900">{b.t}</h3>
            <p className="mt-1.5 text-sm text-slate-500">{b.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href={`/${locale}/submit`}
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          {isAr ? "أرسل عقارك" : "Submit your property"}
        </Link>
        <a
          href="https://wa.me/905432466309"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1eb85a]"
        >
          WhatsApp
        </a>
      </div>
    </section>
  )
}
