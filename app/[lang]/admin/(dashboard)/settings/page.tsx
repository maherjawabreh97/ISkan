import { notFound, redirect } from "next/navigation"
import { KeyRound, ShieldCheck } from "lucide-react"
import { changeOwnPasswordAction } from "@/app/[lang]/admin/actions"
import { getCurrentUser } from "@/lib/auth"
import { getAdminDict } from "@/lib/dictionaries/admin"
import { hasLocale, type Locale } from "@/lib/i18n"

export const dynamic = "force-dynamic"

/** Maps the `?error=` / `?ok=` codes from the action to a sentence. */
function messageFor(locale: Locale, search: string, t: ReturnType<typeof getAdminDict>): string | null {
  const params = new URLSearchParams(search)
  if (params.get("ok") === "1") return t.settings.passwordOk

  const error = params.get("error")
  if (!error) return null

  const copy = {
    current: t.settings.passwordErrorCurrent,
    confirm: t.settings.passwordErrorConfirm,
    short: t.settings.passwordErrorShort,
    weak: t.settings.passwordErrorWeak,
  } as Record<string, string>

  return copy[error] ?? (locale === "ar" ? "حدث خطأ." : "Something went wrong.")
}

export default async function AdminSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const t = getAdminDict(locale)

  const user = await getCurrentUser()
  if (!user) redirect(`/${locale}/admin/login`)

  const { search } = await searchParams
  const query = typeof search === "string" ? search : ""
  const message = messageFor(locale, query, t)
  const isError = new URLSearchParams(query).has("error")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-black text-white">
          <KeyRound className="size-7 text-gold-400" />
          {t.settings.settingsTitle}
        </h1>
        <p className="mt-1 text-sm font-semibold text-white/50">
          {t.settings.settingsSubtitle}
        </p>
      </div>

      {message && (
        <p
          role="status"
          className={`rounded-2xl px-4 py-3 text-sm font-bold ring-1 ${
            isError
              ? "bg-rose-500/10 text-rose-200 ring-rose-400/30"
              : "bg-emerald-500/10 text-emerald-200 ring-emerald-400/30"
          }`}
        >
          {message}
        </p>
      )}

      <section className="rounded-3xl bg-white/[0.04] p-6 ring-1 ring-white/10">
        <h2 className="flex items-center gap-2 text-lg font-black text-white">
          <ShieldCheck className="size-5 text-gold-400" />
          {t.settings.passwordTitle}
        </h2>
        <p className="mt-1 text-sm font-semibold text-white/50">
          {t.settings.passwordIntro}
        </p>

        <form action={changeOwnPasswordAction} className="mt-5 space-y-4">
          <input type="hidden" name="lang" value={locale} />

          <label className="block">
            <span className="text-xs font-extrabold uppercase tracking-wide text-white/50">
              {t.settings.passwordCurrent}
            </span>
            <input
              type="password"
              name="currentPassword"
              required
              autoComplete="current-password"
              className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-gold-400/60"
            />
          </label>

          <label className="block">
            <span className="text-xs font-extrabold uppercase tracking-wide text-white/50">
              {t.settings.passwordNew}
            </span>
            <input
              type="password"
              name="newPassword"
              required
              minLength={12}
              autoComplete="new-password"
              className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-gold-400/60"
            />
          </label>

          <label className="block">
            <span className="text-xs font-extrabold uppercase tracking-wide text-white/50">
              {t.settings.passwordConfirm}
            </span>
            <input
              type="password"
              name="confirmPassword"
              required
              minLength={12}
              autoComplete="new-password"
              className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-gold-400/60"
            />
          </label>

          <button
            type="submit"
            className="cursor-pointer rounded-full bg-gold-400 px-6 py-3 text-sm font-black text-ink-950 transition hover:bg-gold-300"
          >
            {t.settings.passwordSave}
          </button>
        </form>
      </section>

      <section className="rounded-3xl bg-white/[0.04] p-6 ring-1 ring-white/10">
        <h2 className="text-lg font-black text-white">{t.settings.sessionTitle}</h2>
        <p className="mt-1 text-sm font-semibold text-white/50">
          {t.settings.sessionNote}
        </p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-extrabold uppercase tracking-wide text-white/40">
              {t.settings.sessionUser}
            </dt>
            <dd className="mt-1 font-bold text-white">{user.username}</dd>
          </div>
          <div>
            <dt className="text-xs font-extrabold uppercase tracking-wide text-white/40">
              {t.settings.sessionRole}
            </dt>
            <dd className="mt-1 font-bold text-white">
              {t.roles[user.role] ?? user.role}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  )
}