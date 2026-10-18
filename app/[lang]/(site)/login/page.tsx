import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowLeft, LogIn } from "lucide-react"
import { loginAction } from "@/app/[lang]/(site)/account/actions"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ done?: string; error?: string; next?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params
  const locale: Locale = hasLocale(lang) ? lang : "ar"
  const dict = await getDictionary(locale)
  return { title: dict.account.loginTitle, robots: { index: false, follow: false } }
}

const inputCls =
  "w-full rounded-xl border-0 bg-sand-100 px-4 py-3 text-sm font-semibold text-ink-900 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-brand-600"
const labelCls = "mb-1.5 block text-xs font-extrabold text-slate-500"

export default async function LoginPage({ params, searchParams }: PageProps) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const dict = await getDictionary(locale)
  const { done, error, next } = await searchParams
  const t = dict.account

  const errors: Record<string, string> = {
    required: t.errorRequired,
    invalid: t.errorInvalid,
    unverified: t.errorUnverified,
    suspended: t.errorSuspended,
    rate: t.errorRate,
  }
  const message = error ? errors[error] ?? t.errorInvalid : ""

  /** Only same-site paths, so the field can never be used as an open redirect. */
  const nextPath =
    next && (next.startsWith(`/${locale}/`) || next === `/${locale}`)
      ? next
      : `/${locale}/account`

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
            {t.loginTitle}
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-14">
        {done ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200/70">
            <h2 className="font-heading text-xl font-bold text-ink-900">
              {t.doneTitle}
            </h2>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-500">
              {t.doneBody}
            </p>
          </div>
        ) : (
          <form
            action={loginAction}
            className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 sm:p-8"
          >
            <input type="hidden" name="lang" value={locale} />
            <input type="hidden" name="next" value={nextPath} />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-[9999px] top-auto h-px w-px overflow-hidden opacity-0"
            >
              <label htmlFor="login-website">Website</label>
              <input
                id="login-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {message && (
              <p className="mb-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-200">
                {message}
              </p>
            )}

            <div>
              <label className={labelCls} htmlFor="l-identifier">
                {t.identifier}
              </label>
              <input
                id="l-identifier"
                name="identifier"
                required
                dir="ltr"
                autoComplete="username"
                placeholder={t.identifierPlaceholder}
                className={inputCls}
              />
            </div>

            <div className="mt-4">
              <label className={labelCls} htmlFor="l-password">
                {t.password}
              </label>
              <input
                id="l-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className={inputCls}
              />
            </div>

            <button
              type="submit"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink-900 px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-ink-800"
            >
              <LogIn className="size-4" />
              {t.loginButton}
            </button>

            <p className="mt-5 text-center text-sm font-semibold text-slate-500">
              {t.noAccount}{" "}
              <Link
                href={`/${locale}/register`}
                className="font-extrabold text-brand-700 underline underline-offset-2"
              >
                {t.registerLink}
              </Link>
            </p>
          </form>
        )}
      </section>
    </div>
  )
}