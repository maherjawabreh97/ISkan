import Link from "next/link"
import { notFound } from "next/navigation"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"
import {
  Compass,
  Megaphone,
  Building2,
  HardHat,
  Plane,
  ShieldCheck,
  FileText,
  KeyRound,
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const isAr = locale === "ar"
  const dict = await getDictionary(locale)

  const services = isAr
    ? [
        { icon: Compass, t: "استشارات عقارية", d: "تحليل سوق، اختيار مناطق، تقييم عائد، خطة استثمار." },
        { icon: Megaphone, t: "تسويق عقاري", d: "عرض عقارك لشبكة واسعة من المشترين (محلي + دولي)." },
        { icon: Building2, t: "إدارة أملاك", d: "تأجير، صيانة، تحصيل إيجارات، تقارير دورية." },
        { icon: HardHat, t: "تطوير عقاري", d: "شراكات تطوير ومشاريع حصرية." },
        { icon: Plane, t: "جولات واستقبال", d: "استقبال مطار، جولات عقارية، ترتيبات إقامة." },
        { icon: ShieldCheck, t: "خدمات قانونية", d: "فحص Tapu، عقود، توكيل (Power of Attorney)." },
        { icon: FileText, t: "جنسية تركية", d: "إرشاد كامل لبرنامج الجنسية عبر الاستثمار." },
        { icon: KeyRound, t: "إدارة ما بعد البيع", d: "نقل مرافق، تأمين، تسجيل إقامة." },
      ]
    : [
        { icon: Compass, t: "Property consulting", d: "Market analysis, area selection, yield assessment, investment plan." },
        { icon: Megaphone, t: "Property marketing", d: "Expose your listing to a wide buyer network (local + international)." },
        { icon: Building2, t: "Property management", d: "Renting, maintenance, rent collection, periodic reports." },
        { icon: HardHat, t: "Property development", d: "Development partnerships and exclusive projects." },
        { icon: Plane, t: "Tours & reception", d: "Airport pickup, property tours, accommodation." },
        { icon: ShieldCheck, t: "Legal services", d: "Tapu checks, contracts, Power of Attorney." },
        { icon: FileText, t: "Turkish citizenship", d: "Full guidance for the citizenship-by-investment program." },
        { icon: KeyRound, t: "After-sale management", d: "Utility transfers, insurance, residence registration." },
      ]

  const fees = isAr
    ? [
        { item: "استشارة أولية", value: isAr ? "مجانية" : "Free" },
        { item: "عمولة شراء (مشتري)", value: "0% (يدفع البائع)" },
        { item: "عمولة بيع (بائع)", value: "2-3% من قيمة البيع" },
        { item: "إدارة أملاك", value: "8-12% من الإيجار" },
        { item: "خدمات قانونية", value: "حسب الحالة" },
      ]
    : [
        { item: "Initial consultation", value: "Free" },
        { item: "Buyer commission", value: "0% (paid by seller)" },
        { item: "Seller commission", value: "2-3% of sale price" },
        { item: "Property management", value: "8-12% of rent" },
        { item: "Legal services", value: "Case by case" },
      ]

  return (
    <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      <span className="block h-px w-7 bg-gold-500" />
      <h1 className="mt-4 font-heading text-2xl font-bold text-ink-900 sm:text-3xl">
        {isAr ? "خدماتنا" : "Our services"}
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-7 text-slate-600">
        {isAr
          ? "حلول عقارية شاملة — من الاستشارة إلى التسليم وما بعد البيع."
          : "End-to-end real estate solutions — from consultation to delivery and beyond."}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {services.map((s) => (
          <div
            key={s.t}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:ring-brand-300 hover:shadow-md"
          >
            <s.icon className="size-6 text-brand-600" />
            <h3 className="mt-3 font-heading text-base font-bold text-ink-900">{s.t}</h3>
            <p className="mt-1.5 text-sm leading-6 text-slate-500">{s.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl bg-sand-50 p-6 ring-1 ring-slate-200/70">
        <h2 className="font-heading text-lg font-bold text-ink-900">
          {isAr ? "الرسوم" : "Fees"}
        </h2>
        <dl className="mt-4 space-y-2">
          {fees.map((f) => (
            <div key={f.item} className="flex items-center justify-between gap-3 text-sm">
              <dt className="text-slate-600">{f.item}</dt>
              <dd className="font-bold text-ink-900">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href={`/${locale}/properties`}
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          {dict.nav.properties}
        </Link>
        <Link
          href={`/${locale}/submit`}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-bold text-ink-900 transition hover:border-brand-400"
        >
          {dict.nav.submit}
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
