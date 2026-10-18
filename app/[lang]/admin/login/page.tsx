import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Lock } from "lucide-react"
import { loginAction } from "@/app/[lang]/admin/actions"
import { LanguageSwitcher } from "@/components/language-switcher"
import { getCurrentUser } from "@/lib/auth"
import { getAdminDict } from "@/lib/dictionaries/admin"
import { hasLocale, type Locale } from "@/lib/i18n"

type PageProps = {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ error?: string }>
}

export default async function AdminLoginPage({ params, searchParams }: PageProps) {
  const { lang } = await params
  const locale: Locale = hasLocale(lang) ? lang : "ar"
  const { error } = await searchParams
  const t = getAdminDict(locale)

  const current = await getCurrentUser()
  if (current) redirect(`/${locale}/admin`)

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-ink-950 px-4 py-16">
      <div className="bg-grid-dark absolute inset-0 opacity-40" />
      <div className="absolute -top-24 end-0 size-80 rounded-full bg-brand-600/20 blur-3xl" />
      <div className="absolute bottom-0 -start-20 size-80 rounded-full bg-gold-500/15 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-5 flex items-center justify-between">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-sm font-bold text-white/70 transition hover:text-white"
          >
            <ArrowLeft className="size-4 rtl:-scale-x-100" />
            {locale === "ar" ? "العودة للموقع" : "Back to site"}
          </Link>
          <LanguageSwitcher locale={locale} />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl backdrop-blur-xl sm:p-9">
          <span className="inline-grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 text-ink-950 shadow-lg">
            <Lock className="size-6" />
          </span>
          <h1 className="mt-5 text-2xl font-black text-white">
            {t.login.title}
          </h1>
          <p className="mt-1.5 text-sm font-semibold text-white/50">
            {t.login.subtitle}
          </p>

          {error && (
            <p className="mt-5 rounded-xl bg-red-500/15 px-4 py-3 text-sm font-bold text-red-200 ring-1 ring-red-400/30">
              {error === "blocked"
                ? t.login.blocked
                : error === "rate"
                  ? t.login.rateLimit
                  : t.login.error}
            </p>
          )}

          <form action={loginAction} className="mt-6 space-y-4">
            <input type="hidden" name="lang" value={locale} />
            {/* Honeypot: hidden from humans, irresistible to bots. */}
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
            <div>
              <label
                className="mb-1.5 block text-xs font-extrabold text-white/60"
                htmlFor="login-username"
              >
                {t.login.username}
              </label>
              <input
                id="login-username"
                name="username"
                required
                autoComplete="username"
                className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-bold text-white outline-none transition placeholder:text-white/30 focus:border-gold-400/60 focus:bg-white/[0.09]"
              />
            </div>
            <div>
              <label
                className="mb-1.5 block text-xs font-extrabold text-white/60"
                htmlFor="login-password"
              >
                {t.login.password}
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-bold text-white outline-none transition placeholder:text-white/30 focus:border-gold-400/60 focus:bg-white/[0.09]"
              />
            </div>
            <button
              type="submit"
              className="btn-gold w-full rounded-xl px-6 py-3.5 text-sm font-black text-ink-950 transition hover:brightness-105"
            >
              {t.login.submit}
            </button>          </form>

          <p className="mt-5 text-center text-[11px] font-semibold leading-relaxed text-white/40">
            <Link
              href={`/${locale}/privacy`}
              className="font-bold text-white/60 underline underline-offset-2 transition hover:text-gold-400"
            >
              {t.login.privacyLink}
            </Link>
          </p>

          {process.env.NODE_ENV !== "production" && (
            <p className="mt-5 text-center text-[11px] font-semibold text-white/35">
              {t.login.hint}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
