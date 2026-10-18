import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowLeft, ShieldCheck } from "lucide-react"
import {
  registerAction,
  resendCodeAction,
  verifyCodeAction,
} from "@/app/[lang]/(site)/account/actions"
import { getAccountById, MAX_VERIFICATION_SENDS } from "@/lib/accounts"
import {
  getPendingVerificationId,
  getVerificationDelivery,
} from "@/lib/account-session"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ lang: string }>
  searchParams: Promise<{
    verify?: string
    done?: string
    error?: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params
  const locale: Locale = hasLocale(lang) ? lang : "ar"
  const dict = await getDictionary(locale)
  return { title: dict.account.registerTitle, robots: { index: false, follow: false } }
}

const inputCls =
  "w-full rounded-xl border-0 bg-sand-100 px-4 py-3 text-sm font-semibold text-ink-900 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-brand-600"
const labelCls = "mb-1.5 block text-xs font-extrabold text-slate-500"

export default async function RegisterPage({ params, searchParams }: PageProps) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const dict = await getDictionary(locale)
  const { verify, done, error } = await searchParams

  const t = dict.account

  // The code only ever travels by email, so nothing is read back out of the
  // database for it. This flag only decides which confirmation message to show.
  const delivered = (await getVerificationDelivery()) === "email"

  // How many of the three allowed sends have gone out, so the link can stop
  // offering itself once there is nothing left to send.
  const pendingId = await getPendingVerificationId()
  const pendingAccount = pendingId ? await getAccountById(pendingId) : null
  const sendsUsed = pendingAccount?.verifySends ?? 0
  const sendsLeft = Math.max(0, MAX_VERIFICATION_SENDS - sendsUsed)

  const errors: Record<string, string> = {
    required: t.errorRequired,
    weak: t.errorWeakPassword,
    mismatch: t.errorMismatch,
    identifier: t.errorIdentifier,
    restart: t.errorRestart,
    tooManySends: t.errorTooManySends,
    taken: t.errorTaken,
    rate: t.errorRate,
    wrongCode: t.errorWrongCode,
    expired: t.errorExpired,
    locked: t.errorLocked,
  }
  const message = error ? errors[error] ?? t.errorRequired : ""

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
            {verify ? t.verifyTitle : t.registerTitle}
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        {done ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200/70">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <ShieldCheck className="size-8" />
            </span>
            <h2 className="mt-5 font-heading text-xl font-bold text-ink-900">
              {t.doneTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm font-semibold leading-relaxed text-slate-500">
              {t.doneBody}
            </p>
          </div>
        ) : verify ? (
          <div className="space-y-5">
            {message && (
              <p className="rounded-2xl bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700 ring-1 ring-rose-200">
                {message}
              </p>
            )}

            <div
              className={`rounded-2xl border-2 p-5 text-center ${
                delivered
                  ? "border-brand-200 bg-brand-50/70"
                  : "border-amber-200 bg-amber-50/80"
              }`}
            >
              <p
                className={`text-[11px] font-bold uppercase tracking-[0.14em] ${
                  delivered ? "text-brand-700" : "text-amber-700"
                }`}
              >
                {t.codeLabel}
              </p>
              <p className="mt-3 text-sm font-bold text-ink-900">
                {delivered ? t.codeSent : t.codeSendFailed}
              </p>
            </div>

            {/* Quiet retry: the code only ever travels by email, so if it does not
                arrive this is how the visitor asks for another one. It stops
                offering itself once the three sends are used up. */}
            {sendsLeft > 0 && (
              <form action={resendCodeAction} className="mt-4 text-center">
                <input type="hidden" name="lang" value={locale} />
                <input type="hidden" name="website" value="" />
                <button
                  type="submit"
                  className="cursor-pointer text-xs font-bold text-slate-500 underline underline-offset-4 transition hover:text-brand-700"
                >
                  {t.resendButton}
                </button>
              </form>
            )}

            <form
              action={verifyCodeAction}
              className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 sm:p-8"
            >
              <input type="hidden" name="lang" value={locale} />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-[9999px] top-auto h-px w-px overflow-hidden opacity-0"
              >
                <label htmlFor="reg-website">Website</label>
                <input id="reg-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
              </div>

              <div>
                <label className={labelCls} htmlFor="v-code">
                  {t.codeLabel}
                </label>
                <input
                  id="v-code"
                  name="code"
                  required
                  inputMode="numeric"
                  dir="ltr"
                  maxLength={6}
                  placeholder="000000"
                  className={`${inputCls} tracking-[0.3em]`}
                />
              </div>

              <button
                type="submit"
                className="mt-5 w-full rounded-xl bg-ink-900 px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-ink-800"
              >
                {t.verifyButton}
              </button>
            </form>

            {/* The code is on its way by email; nothing else belongs on this screen.
                If it never arrives the account is still waiting and can be
                confirmed from the dashboard. */}
          </div>
        ) : (
          <form
            action={registerAction}
            className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 sm:p-8"
          >
            <input type="hidden" name="lang" value={locale} />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-[9999px] top-auto h-px w-px overflow-hidden opacity-0"
            >
              <label htmlFor="reg-website">Website</label>
              <input id="reg-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            {message && (
              <p className="mb-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-200">
                {message}
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls} htmlFor="r-name">
                  {t.name}
                </label>
                <input id="r-name" name="name" required className={inputCls} />
              </div>
              <div>
                <label className={labelCls} htmlFor="r-fullName">
                  {t.fullName}
                </label>
                <input id="r-fullName" name="fullName" required className={inputCls} />
              </div>
              <div>
                <label className={labelCls} htmlFor="r-gender">
                  {t.gender}
                </label>
                <select id="r-gender" name="gender" required defaultValue="" className={inputCls}>
                  <option value="" disabled>
                    {t.choose}
                  </option>
                  {t.genderOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="r-nationality">
                  {t.nationality}
                </label>
                <input id="r-nationality" name="nationality" required className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls} htmlFor="r-identifier">
                  {t.identifier}
                </label>
                <input
                  id="r-identifier"
                  name="identifier"
                  required
                  dir="ltr"
                  placeholder={t.identifierPlaceholder}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="r-password">
                  {t.password}
                </label>
                <input
                  id="r-password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="r-passwordConfirm">
                  {t.passwordConfirm}
                </label>
                <input
                  id="r-passwordConfirm"
                  name="passwordConfirm"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className={inputCls}
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 w-full rounded-xl bg-gold-400 px-6 py-3.5 text-sm font-extrabold text-ink-950 transition hover:brightness-105"
            >
              {t.registerButton}
            </button>

            <p className="mt-4 text-center text-sm font-semibold text-slate-500">
              {t.haveAccount}{" "}
              <Link
                href={`/${locale}/login`}
                className="font-extrabold text-brand-700 underline underline-offset-2"
              >
                {t.loginLink}
              </Link>
            </p>
          </form>
        )}
      </section>
    </div>
  )
}
