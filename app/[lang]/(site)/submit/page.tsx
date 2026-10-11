import Link from "next/link"
import { notFound } from "next/navigation"
import {
  CheckCircle2,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react"
import { SubmitForm } from "@/components/site/submit-form"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"
import { site } from "@/lib/site"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ sent?: string; error?: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params
  const locale = hasLocale(lang) ? lang : "ar"
  const dict = await getDictionary(locale)
  return {
    title: dict.meta.submitTitle,
    description: dict.meta.submitDescription,
  }
}

export default async function SubmitPage({ params, searchParams }: PageProps) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const dict = await getDictionary(locale)
  const { sent, error } = await searchParams

  const t = dict.submit
  const waNumber = site.phoneHref.replace(/[^0-9]/g, "")
  const whatsapp = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    t.whatsappPrefill,
  )}`

  const errorMessage =
    error === "rate"
      ? t.errorRate
      : error === "required"
        ? t.errorRequired
        : ""

  return (
    <div className="bg-sand-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ink-950 via-ink-900 to-brand-900 px-4 py-14 text-white sm:px-6 sm:py-20">
        <div className="pointer-events-none absolute -top-24 end-[-6rem] size-80 rounded-full bg-gold-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 start-[-4rem] size-80 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 text-xs font-extrabold text-gold-300">
            <Sparkles className="size-3.5" />
            {t.badge}
          </span>
          <h1 className="mt-5 text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
            {t.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-semibold leading-relaxed text-white/70 sm:text-base">
            {t.subtitle}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div>
            {sent ? (
              <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200/70">
                <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="size-8" />
                </span>
                <h2 className="mt-5 text-2xl font-black text-ink-900">
                  {t.successTitle}
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm font-semibold leading-relaxed text-slate-500">
                  {t.successBody}
                </p>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-emerald-600"
                  >
                    <MessageCircle className="size-4" />
                    {t.successWhatsapp}
                  </a>
                  <Link
                    href={`/${locale}/submit`}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-extrabold text-ink-900 transition hover:border-brand-300 hover:text-brand-700"
                  >
                    <Send className="size-4" />
                    {t.successAgain}
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {errorMessage && (
                  <div className="mb-5 rounded-2xl bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700 ring-1 ring-rose-200">
                    {errorMessage}
                  </div>
                )}
                <SubmitForm locale={locale} dict={dict} />
              </>
            )}
          </div>

          {/* Aside */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl bg-ink-950 p-6 text-white shadow-sm">
              <h2 className="text-lg font-black">{t.asideTitle}</h2>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-white/70">
                {t.asideBody}
              </p>
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-emerald-600"
              >
                <MessageCircle className="size-4" />
                {t.whatsappCta}
              </a>
              <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-white/50">
                <ShieldCheck className="size-3.5 shrink-0" />
                {t.responseNote}
              </p>
            </div>

            <div className="mt-4 rounded-3xl bg-white p-5 text-xs font-semibold leading-relaxed text-slate-500 ring-1 ring-slate-200/70">
              <span className="flex items-center gap-2 text-ink-900">
                <Upload className="size-4 shrink-0 text-brand-700" />
                <span className="text-sm font-black">{t.photosSection}</span>
              </span>
              <p className="mt-2">{t.photosEmpty}</p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
