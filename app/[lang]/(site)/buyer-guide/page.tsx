import Link from "next/link"
import { notFound } from "next/navigation"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"
import { ShieldCheck, FileCheck, Plane, Home, Banknote, KeyRound } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function BuyerGuidePage({
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
        { icon: ShieldCheck, t: "1. استشارة وتحديد الميزانية", d: "نحدد ميزانيتك، هدفك (سكن/استثمار/جنسية) والمنطقة المفضلة." },
        { icon: Home, t: "2. اختيار العقار", d: "نقترح عقارات مناسبة ونظم جولات (عن بُعد أو حضورياً)." },
        { icon: FileCheck, t: "3. تحقق قانوني", d: "فحص Tapu و Ekspertiz قبل أي عقد. خلو العقار من القيود." },
        { icon: Banknote, t: "4. الدفع والعقد", d: "Valör (تحويل بنكي) + توقيع عقد بيع (Sözleşme)." },
        { icon: KeyRound, t: "5. نقل الملكية (Tapu)", d: "تسجيل سند الملكية باسمك في مديرية الطابو." },
        { icon: Plane, t: "6. ما بعد البيع", d: "إقامة/جنسية، إدارة أملاك، تأجير، صيانة." },
      ]
    : [
        { icon: ShieldCheck, t: "1. Consult & budget", d: "We define your budget, goal (living/investment/citizenship) and preferred area." },
        { icon: Home, t: "2. Select", d: "We propose matching properties and arrange tours (remote or in person)." },
        { icon: FileCheck, t: "3. Legal check", d: "Tapu and Ekspertiz verification before any contract. Property free of encumbrances." },
        { icon: Banknote, t: "4. Payment & contract", d: "Bank transfer (Valör) + sales contract (Sözleşme)." },
        { icon: KeyRound, t: "5. Title deed (Tapu)", d: "Register the title deed in your name at the Land Registry." },
        { icon: Plane, t: "6. After sale", d: "Residence/citizenship, property management, rental, maintenance." },
      ]


  return (
    <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      <span className="block h-px w-7 bg-gold-500" />
      <h1 className="mt-4 font-heading text-2xl font-bold text-ink-900 sm:text-3xl">
        {isAr ? "دليل المشتري" : "Buyer's guide"}
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-7 text-slate-600">
        {isAr
          ? "كل ما تحتاج معرفته لشراء عقار في تركيا — من البحث إلى تسليم المفاتيح."
          : "Everything you need to know to buy property in Turkey — from search to key handover."}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((s) => (
          <div
            key={s.t}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70"
          >
            <s.icon className="size-6 text-brand-600" />
            <h3 className="mt-3 font-heading text-base font-bold text-ink-900">{s.t}</h3>
            <p className="mt-1.5 text-sm leading-6 text-slate-500">{s.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href={`/${locale}/properties`}
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          {dict.nav.properties}
        </Link>
        <Link
          href={`/${locale}/citizenship`}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-bold text-ink-900 transition hover:border-brand-400"
        >
          {isAr ? "الجنسية التركية" : "Turkish citizenship"}
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
