import Link from "next/link"
import { notFound } from "next/navigation"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"
import { ShieldCheck, FileText, Home, Plane, CheckCircle2 } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function CitizenshipPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const isAr = locale === "ar"
  const dict = await getDictionary(locale)

  const requirements = isAr
    ? [
        "شراء عقار (أو عدة عقارات) بقيمة لا تقل عن 400,000 USD.",
        "تعهد بعدم البيع لمدة 3 سنوات (قيد على سند الملكية).",
        "تقييم عقاري (Ekspertiz) من مُقيّم مرخص.",
        "جواز سفر مترجم وموثق (Noter).",
        "رقم ضريبي تركي (Vergi No).",
        "شهادة تأمين DASK (تأمين زلزال).",
        "فتح حساب بنكي تركي.",
      ]
    : [
        "Purchase property (or properties) worth at least USD 400,000.",
        "3-year no-sale commitment (annotation on title deed).",
        "Appraisal report (Ekspertiz) from a licensed appraiser.",
        "Translated and notarized passport.",
        "Turkish tax number (Vergi No).",
        "DASK earthquake insurance.",
        "Open a Turkish bank account.",
      ]

  const steps = isAr
    ? [
        { icon: Home, t: "1. اختيار العقار المؤهل", d: " nieruchomości بقيمة ≥ 400,000 USD. نرشدك إلى الخيارات المؤهلة." },
        { icon: FileText, t: "2. Ekspertiz + Tapu", d: "تقييم + نقل الملكية باسمك مع قيد 3 سنوات." },
        { icon: ShieldCheck, t: "3. تقديم الطلب", d: "تجميع الوثائق وتقديم طلب الجنسية." },
        { icon: CheckCircle2, t: "4. الموافقة", d: "استلام شهادة الجنسية (Vatandaşlık Belgesi)." },
        { icon: Plane, t: "5. جواز السفر", d: "تقديم طلب جواز السفر التركي." },
      ]
    : [
        { icon: Home, t: "1. Choose eligible property", d: "Property worth ≥ USD 400,000. We guide you to eligible options." },
        { icon: FileText, t: "2. Ekspertiz + Tapu", d: "Appraisal + title deed transfer in your name with 3-year annotation." },
        { icon: ShieldCheck, t: "3. Apply", d: "Compile documents and submit citizenship application." },
        { icon: CheckCircle2, t: "4. Approval", d: "Receive citizenship certificate (Vatandaşlık Belgesi)." },
        { icon: Plane, t: "5. Passport", d: "Apply for Turkish passport." },
      ]

  // fix typo in Arabic step 1
  if (isAr) steps[0].d = "عقارات بقيمة ≥ 400,000 USD. نرشدك إلى الخيارات المؤهلة."

  return (
    <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      <span className="block h-px w-7 bg-gold-500" />
      <h1 className="mt-4 font-heading text-2xl font-bold text-ink-900 sm:text-3xl">
        {isAr ? "الجنسية التركية عبر الاستثمار" : "Turkish citizenship by investment"}
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-7 text-slate-600">
        {isAr
          ? "احصل على جنسية تركية (وجواز سفر) عبر شراء عقار بقيمة 400,000 دولار أو أكثر. نرافقك في كل خطوة."
          : "Obtain Turkish citizenship (and passport) by purchasing property worth USD 400,000 or more. We accompany you at every step."}
      </p>

      <div className="mt-8 rounded-2xl bg-gradient-to-br from-brand-900 to-ink-950 p-6 text-white sm:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-300">
          {isAr ? "الحد الأدنى" : "Minimum investment"}
        </p>
        <p className="mt-2 font-heading text-4xl font-bold text-gold-300">USD 400,000</p>
        <p className="mt-2 text-sm text-white/70">
          {isAr
            ? "مع تعهد بعدم البيع لمدة 3 سنوات. العقار يبقى ملكك (أصل عقاري، وليس تبرعاً)."
            : "With a 3-year no-sale commitment. The property remains yours (real asset, not a donation)."}
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-sand-50 p-6 ring-1 ring-slate-200/70">
          <h2 className="font-heading text-lg font-bold text-ink-900">
            {isAr ? "المتطلبات" : "Requirements"}
          </h2>
          <ul className="mt-4 space-y-2">
            {requirements.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-600" />
                {r}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-sand-50 p-6 ring-1 ring-slate-200/70">
          <h2 className="font-heading text-lg font-bold text-ink-900">
            {isAr ? "العملية" : "The process"}
          </h2>
          <div className="mt-4 space-y-3">
            {steps.map((s) => (
              <div key={s.t} className="flex items-start gap-3">
                <s.icon className="mt-0.5 size-5 shrink-0 text-brand-600" />
                <div>
                  <p className="font-heading text-sm font-bold text-ink-900">{s.t}</p>
                  <p className="text-xs text-slate-500">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href={`/${locale}/properties?citizenship=1`}
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          {isAr ? "عقارات مؤهلة" : "Eligible properties"}
        </Link>
        <Link
          href={`/${locale}/buyer-guide`}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-bold text-ink-900 transition hover:border-brand-400"
        >
          {isAr ? "دليل المشتري" : "Buyer's guide"}
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
