import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowLeft, Flag, ShieldCheck } from "lucide-react"
import { reportUserAction } from "@/app/[lang]/(site)/account/actions"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ user?: string; done?: string; error?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params
  const locale: Locale = hasLocale(lang) ? lang : "ar"
  const dict = await getDictionary(locale)
  return { title: dict.report.title, robots: { index: false, follow: false } }
}

const inputCls =
  "w-full rounded-xl border-0 bg-sand-100 px-4 py-3 text-sm font-semibold text-ink-900 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-brand-600"
const labelCls = "mb-1.5 block text-xs font-extrabold text-slate-500"

export default async function ReportPage({ params, searchParams }: PageProps) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const dict = await getDictionary(locale)
  const { user, done, error } = await searchParams
  const t = dict.report

  return (
    <div className="bg-sand-50">
      <section className="bg-gradient-to-br from-ink-950 via-ink-900 to-brand-900 px-4 py-10 text-white sm:px-6 sm:py-14">
        <div className="relative mx-auto max-w-3xl">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-sm font-bold text-white/60 transition hover:text-white"
          >
            <ArrowLeft className="size-4 rtl:-scale-x-100" />
            {t.backHome}
          </Link>
          <h1 className="mt-5 font-heading text-2xl font-bold sm:text-3xl">
            {t.title}
          </h1>
          <p className="mt-2 max-w-xl text-sm font-medium leading-7 text-white/70">
            {t.subtitle}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        {done ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200/70">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <ShieldCheck className="size-8" />
            </span>
            <h2 className="mt-5 font-heading text-xl font-bold text-ink-900">
              {t.successTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm font-semibold leading-relaxed text-slate-500">
              {t.successBody}
            </p>
          </div>
        ) : (
          <form
            action={reportUserAction}
            className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 sm:p-8"
          >
            <input type="hidden" name="lang" value={locale} />
            {/* Which account is being reported. Omitted when a visitor reports
                something generally; the admin still sees the context. */}
            <input type="hidden" name="targetUserId" value={user ?? "unknown"} />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-[9999px] top-auto h-px w-px overflow-hidden opacity-0"
            >
              <label htmlFor="rep-website">Website</label>
              <input
                id="rep-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {error && (
              <p className="mb-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-200">
                {dict.account.errorRequired}
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelCls} htmlFor="rp-name">
                  {t.yourName}
                </label>
                <input id="rp-name" name="reporterName" autoComplete="name" className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls} htmlFor="rp-email">
                  {t.yourEmail}
                </label>
                <input
                  id="rp-email"
                  name="reporterEmail"
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                  className={inputCls}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls} htmlFor="rp-reason">
                  {t.reason}
                </label>
                <select
                  id="rp-reason"
                  name="reason"
                  required
                  defaultValue={t.reasons[0]}
                  className={inputCls}
                >
                  {t.reasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls} htmlFor="rp-details">
                  {t.details}
                </label>
                <textarea
                  id="rp-details"
                  name="details"
                  rows={5}
                  placeholder={t.detailsPlaceholder}
                  className={inputCls}
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-rose-700"
            >
              <Flag className="size-4" />
              {t.submit}
            </button>
          </form>
        )}
      </section>
    </div>
  )
}