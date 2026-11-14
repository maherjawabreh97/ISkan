import Link from "next/link"
import { notFound } from "next/navigation"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"
import { Mail, MapPin, Phone } from "lucide-react"
import { WhatsAppIcon } from "@/components/whatsapp-icon"

export const dynamic = "force-dynamic"

export default async function ContactPage({
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
    <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      <span className="block h-px w-7 bg-gold-500" />
      <h1 className="mt-4 font-heading text-2xl font-bold text-ink-900 sm:text-3xl">
        {isAr ? "تواصل معنا" : "Contact us"}
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-7 text-slate-600">
        {isAr
          ? "نحن هنا للإجابة على جميع استفساراتك. تواصل معنا عبر أي من القنوات أدناه."
          : "We are here to answer all your questions. Reach us through any of the channels below."}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <a
          href="https://wa.me/905432466309"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 transition hover:ring-brand-300"
        >
          <span className="grid size-12 place-items-center rounded-xl bg-[#25D366]/10 text-[#25D366]">
            <WhatsAppIcon className="size-6" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">WhatsApp</p>
            <p className="mt-0.5 font-heading text-base font-bold text-ink-900">+90 543 246 63 09</p>
          </div>
        </a>
        <a
          href="tel:+905432466309"
          className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 transition hover:ring-brand-300"
        >
          <span className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <Phone className="size-6" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isAr ? "هاتف" : "Phone"}
            </p>
            <p className="mt-0.5 font-heading text-base font-bold text-ink-900">+90 543 246 63 09</p>
          </div>
        </a>
        <a
          href="mailto:Iskanrealestatetr@gmail.com"
          className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 transition hover:ring-brand-300"
        >
          <span className="grid size-12 place-items-center rounded-xl bg-gold-200/70 text-gold-600">
            <Mail className="size-6" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Email</p>
            <p className="mt-0.5 font-heading text-base font-bold text-ink-900">Iskanrealestatetr@gmail.com</p>
          </div>
        </a>
      </div>

      <div className="mt-8 rounded-2xl bg-sand-50 p-6 ring-1 ring-slate-200/70">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 size-5 shrink-0 text-brand-600" />
          <div>
            <p className="font-heading text-base font-bold text-ink-900">
              {isAr ? "المكتب" : "Office"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {isAr ? "إسطنبول، تركيا" : "Istanbul, Turkey"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Link
          href={`/${locale}/submit`}
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          {dict.nav.submit}
        </Link>
      </div>
    </section>
  )
}
