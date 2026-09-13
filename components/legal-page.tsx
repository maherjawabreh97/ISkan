import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  Mail,
  ShieldCheck,
} from "lucide-react"
import type { Dictionary } from "@/lib/dictionaries/types"
import type { Locale } from "@/lib/i18n"

export type LegalKind = "privacy" | "cookies"

export function LegalPage({
  locale,
  dict,
  kind,
}: {
  locale: Locale
  dict: Dictionary
  kind: LegalKind
}) {
  const isPrivacy = kind === "privacy"
  const title = isPrivacy
    ? dict.legal.privacyTitle
    : dict.legal.cookiesTitle
  const intro = isPrivacy ? dict.legal.privacyIntro : dict.legal.cookiesIntro
  const date = isPrivacy ? dict.legal.privacyDate : dict.legal.cookiesDate
  const sections = isPrivacy
    ? dict.legal.privacySections
    : dict.legal.cookiesSections
  const Icon = isPrivacy ? ShieldCheck : FileText
  const otherHref = isPrivacy ? "cookies" : "privacy"
  const otherLabel = isPrivacy
    ? dict.footer.cookies
    : dict.footer.privacy

  return (
    <>
      <section className="relative overflow-hidden bg-ink-950 py-14 text-white lg:py-16">
        <div className="bg-grid-dark absolute inset-0 opacity-50" />
        <div className="absolute -start-24 top-0 size-72 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="absolute -end-20 bottom-0 size-72 rounded-full bg-gold-500/15 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs font-bold text-white/50">
            <Link href={`/${locale}`} className="transition hover:text-white">
              {dict.nav.home}
            </Link>
            <ChevronRight className="size-3.5 rtl:hidden" />
            <ChevronLeft className="size-3.5 ltr:hidden" />
            <span className="text-gold-300">{title}</span>
          </nav>
          <div className="mt-6 flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-800 text-white shadow-lg ring-1 ring-white/25">
              <Icon className="size-6" />
            </span>
            <div>
              <h1 className="text-3xl font-black sm:text-4xl">{title}</h1>
              <p className="mt-1.5 text-xs font-bold uppercase tracking-widest text-white/40">
                {date}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-slate-200/70 bg-white p-8 shadow-soft sm:p-12">
            <p className="text-[15px] leading-8 text-slate-600">{intro}</p>

            <div className="mt-10 space-y-8">
              {sections.map((section) => (
                <div
                  key={section.heading}
                  className="relative rounded-2xl bg-sand-50 p-6 ring-1 ring-slate-200/70"
                >
                  <span className="absolute inset-x-0 top-0 h-0.5 rounded-full bg-gradient-to-r from-brand-500 via-gold-400 to-brand-500" />
                  <h2 className="text-lg font-extrabold text-ink-900">
                    {section.heading}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {section.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${locale}/${otherHref}`}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-extrabold text-ink-900 transition hover:border-gold-400 hover:bg-gold-400/10"
              >
                <FileText className="size-4 text-brand-600" />
                {otherLabel}
              </Link>
              <Link
                href={`/${locale}`}
                className="btn-gold inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-extrabold"
              >
                <Home className="size-4" />
                {dict.footer.backHome}
              </Link>
            </div>
            <a
              href="mailto:hello@iskan-estate.com"
              className="inline-flex items-center gap-2 text-sm font-extrabold text-brand-700 transition hover:text-brand-600"
            >
              <Mail className="size-4" />
              hello@iskan-estate.com
            </a>
          </div>
        </div>
      </section>
    </>
  )
}