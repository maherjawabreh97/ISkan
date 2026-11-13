import Link from "next/link"
import { notFound } from "next/navigation"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"
import { Award, Building2, Handshake, ShieldCheck, Users } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const isAr = locale === "ar"
  const dict = await getDictionary(locale)

  const stats = [
    { value: "5+", label: isAr ? "سنوات خبرة" : "Years of experience" },
    { value: "5000+", label: isAr ? "عملاء راضون" : "Happy clients" },
    { value: "39", label: isAr ? "قضاء في إسطنبول" : "Istanbul districts" },
    { value: "100%", label: isAr ? "شفافية" : "Transparency" },
  ]

  const values = [
    {
      icon: ShieldCheck,
      title: isAr ? "الموثوقية" : "Trust",
      desc: isAr
        ? "نفحص كل عقار (Tapu، Ekspertiz) قبل أي توصية. لا مفاجآت."
        : "We verify every listing (Tapu, Ekspertiz) before any recommendation. No surprises.",
    },
    {
      icon: Handshake,
      title: isAr ? "ال accompaniment" : "Accompaniment",
      desc: isAr
        ? "من البحث إلى نقل الملكية وما بعد البيع — نحن معك في كل خطوة."
        : "From search to title deed transfer and beyond — we are with you at every step.",
    },
    {
      icon: Award,
      title: isAr ? "الخبرة" : "Expertise",
      desc: isAr
        ? "سنوات من الخبرة في سوق إسطنبول، مع معرفة عميقة بكل حي."
        : "Years of experience in the Istanbul market, with deep knowledge of every district.",
    },
    {
      icon: Users,
      title: isAr ? "العملاء أولاً" : "Client first",
      desc: isAr
        ? "هدفنا إيجاد العقار المناسب لك، وليس بيع أي عقار."
        : "Our goal is to find the right property for you, not to sell any property.",
    },
  ]

  return (
    <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      <span className="block h-px w-7 bg-gold-500" />
      <h1 className="mt-4 font-heading text-2xl font-bold text-ink-900 sm:text-3xl">
        {isAr ? "عن إسكان" : "About Iskan"}
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-7 text-slate-600">
        {isAr
          ? "إسكان عقارية — مكتبك العقاري في إسطنبول. نساعدك على إيجاد، شراء، واستئجار عقارات استثنائية بأسعار شفافة وعناية حقيقية، من البحث حتى تسليم المفاتيح وما بعده."
          : "Iskan Real Estate — your real estate office in Istanbul. We help you find, buy and rent exceptional properties with transparent pricing and genuine care, from search to key handover and beyond."}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl bg-sand-50 px-4 py-5 text-center ring-1 ring-slate-200/70"
          >
            <p className="font-heading text-2xl font-bold text-brand-700">{s.value}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {values.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <Icon className="size-5" />
            </span>
            <h3 className="mt-3 font-heading text-base font-bold text-ink-900">{title}</h3>
            <p className="mt-1.5 text-sm leading-6 text-slate-500">{desc}</p>
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
