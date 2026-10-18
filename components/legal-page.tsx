import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  Mail,
  Scale,
  ShieldCheck,
} from "lucide-react"
import type { Dictionary } from "@/lib/dictionaries/types"
import type { LegalDocument } from "@/lib/dictionaries/legal-extra"
import { listingRules, termsOfUse } from "@/lib/dictionaries/legal-extra"
import type { Locale } from "@/lib/i18n"

export type LegalKind = "privacy" | "cookies" | "terms" | "rules"

const ICONS = {
  privacy: ShieldCheck,
  cookies: FileText,
  terms: Scale,
  rules: FileText,
} as const

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
  const isCookies = kind === "cookies"

  const doc: LegalDocument = isPrivacy
    ? {
        title: dict.legal.privacyTitle,
        intro: dict.legal.privacyIntro,
        date: dict.legal.privacyDate,
        sections: dict.legal.privacySections,
      }
    : isCookies
      ? {
          title: dict.legal.cookiesTitle,
          intro: dict.legal.cookiesIntro,
          date: dict.legal.cookiesDate,
          sections: dict.legal.cookiesSections,
        }
      : kind === "terms"
        ? termsOfUse[locale]
        : listingRules[locale]

  const Icon = ICONS[kind]
  const related: Array<{ href: string; label: string }> = [
    { href: "privacy", label: dict.footer.privacy },
    { href: "cookies", label: dict.footer.cookies },
    { href: "terms", label: dict.footer.terms },
    { href: "rules", label: dict.footer.listingRules },
  ].filter((item) => item.href !== kind)

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
            <span className="text-gold-300">{doc.title}</span>
          </nav>
          <div className="mt-6 flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-800 text-white shadow-lg ring-1 ring-white/25">
              <Icon className="size-6" />
            </span>
            <div>
              <h1 className="text-3xl font-black sm:text-4xl">{doc.title}</h1>
              <p className="mt-1.5 text-xs font-bold uppercase tracking-widest text-white/40">
                {doc.date}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-slate-200/70 bg-white p-8 shadow-soft sm:p-12">
            <p className="text-[15px] leading-8 text-slate-600">{doc.intro}</p>

            <div className="mt-10 space-y-8">
              {doc.sections.map((section) => (
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
              {related.map((item) => (
                <Link
                  key={item.href}
                  href={`/${locale}/${item.href}`}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-extrabold text-ink-900 transition hover:border-gold-400 hover:bg-gold-400/10"
                >
                  <FileText className="size-4 text-brand-600" />
                  {item.label}
                </Link>
              ))}
              <Link
                href={`/${locale}`}
                className="btn-gold inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-extrabold"
              >
                <Home className="size-4" />
                {dict.footer.backHome}
              </Link>
            </div>
            <a
              href="mailto:Iskanrealestatetr@gmail.com"
              className="inline-flex items-center gap-2 text-sm font-extrabold text-brand-700 transition hover:text-brand-600"
            >
              <Mail className="size-4" />
              Iskanrealestatetr@gmail.com
            </a>
          </div>
        </div>
      </section>
    </>
  )
}