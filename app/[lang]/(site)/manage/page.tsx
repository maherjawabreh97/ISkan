import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Lock,
  Trash2,
} from "lucide-react"
import { manageListingAction } from "@/app/[lang]/(site)/manage/actions"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"
import { site } from "@/lib/site"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ code?: string; error?: string; removed?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params
  const locale: Locale = hasLocale(lang) ? lang : "ar"
  const dict = await getDictionary(locale)
  return { title: dict.manage.title, description: dict.manage.subtitle }
}

export default async function ManageListingPage({
  params,
  searchParams,
}: PageProps) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const dict = await getDictionary(locale)
  const { code, error, removed } = await searchParams

  const t = dict.manage
  const inputCls =
    "w-full rounded-xl border-0 bg-sand-100 px-4 py-3 text-sm font-semibold text-ink-900 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-brand-600"

  const errorMessage =
    error === "rate"
      ? t.errorRate
      : error === "missing"
        ? t.errorMissing
        : error === "invalid"
          ? t.errorInvalid
          : ""

  return (
    <div className="bg-sand-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-ink-950 via-ink-900 to-brand-900 px-4 py-12 text-white sm:px-6 sm:py-16">
        <div className="pointer-events-none absolute -top-24 end-[-6rem] size-72 rounded-full bg-gold-400/10 blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-gold-300">
            <Lock className="size-3.5" />
            {t.badge}
          </span>
          <h1 className="mt-4 font-heading text-2xl font-bold leading-tight sm:text-3xl">
            {t.title}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-7 text-white/70">
            {t.subtitle}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-brand-700"
        >
          <ArrowLeft className="size-4 rtl:-scale-x-100" />
          {t.backHome}
        </Link>

        {removed ? (
          <div className="mt-6 rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200/70">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="size-8" />
            </span>
            <h2 className="mt-5 font-heading text-xl font-bold text-ink-900">
              {t.removedTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm font-semibold leading-relaxed text-slate-500">
              {removed === "pending" ? t.removedPending : t.removedLive}
            </p>
            <a
              href={`https://wa.me/${site.phoneHref.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-ink-900 px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-ink-800"
            >
              {t.contactUs}
            </a>
          </div>
        ) : (
          <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 sm:p-8">
            <div className="flex items-start gap-3.5">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                <KeyRound className="size-6" />
              </span>
              <div>
                <h2 className="font-heading text-lg font-bold text-ink-900">
                  {t.formTitle}
                </h2>
                <p className="mt-1 text-[13px] font-semibold leading-6 text-slate-500">
                  {t.formBody}
                </p>
              </div>
            </div>

            {errorMessage && (
              <p className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-200">
                {errorMessage}
              </p>
            )}

            <form action={manageListingAction} className="mt-6 space-y-4">
              <input type="hidden" name="lang" value={locale} />

              {/* Honeypot: hidden from humans, irresistible to bots. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-[9999px] top-auto h-px w-px overflow-hidden opacity-0"
              >
                <label htmlFor="manage-website">Website</label>
                <input
                  id="manage-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div>
                <label
                  className="mb-1.5 block text-xs font-extrabold text-slate-500"
                  htmlFor="manage-code"
                >
                  {t.code}
                </label>
                <input
                  id="manage-code"
                  name="code"
                  required
                  dir="ltr"
                  autoComplete="off"
                  defaultValue={code ?? ""}
                  placeholder="K7F2-9QX4"
                  className={`${inputCls} tracking-[0.16em] uppercase`}
                />
              </div>

              <div>
                <label
                  className="mb-1.5 block text-xs font-extrabold text-slate-500"
                  htmlFor="manage-password"
                >
                  {t.password}
                </label>
                <input
                  id="manage-password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••"
                  className={inputCls}
                />
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink-900 px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-ink-800"
              >
                <Trash2 className="size-4.5" />
                {t.submit}
              </button>

              <p className="text-center text-[11px] font-semibold leading-relaxed text-slate-400">
                {t.warning}
              </p>
            </form>
          </div>
        )}
      </section>
    </div>
  )
}
