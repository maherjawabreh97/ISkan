import { notFound, redirect } from "next/navigation"
import { ShieldCheck, ShieldOff } from "lucide-react"
import { unbanIpAction } from "@/app/[lang]/admin/actions"
import { getCurrentUser } from "@/lib/auth"
import { getAdminDict } from "@/lib/dictionaries/admin"
import { hasLocale, type Locale } from "@/lib/i18n"
import { listBans, listEvents } from "@/lib/security-store"

export const dynamic = "force-dynamic"

function formatDateTime(value: number, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value))
}

export default async function AdminSecurityPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const t = getAdminDict(locale)

  const current = await getCurrentUser()
  if (!current) redirect(`/${locale}/admin/login`)
  if (current.role !== "admin") redirect(`/${locale}/admin`)

  const [bans, events] = await Promise.all([listBans(), listEvents(50)])
  // A ban whose span exceeds ~9 years is treated as permanent (see
  // security-store: permanent bans are stored 10 years out).
  const permanentSpan = 9 * 365 * 24 * 60 * 60 * 1000

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-black text-white">
          <ShieldCheck className="size-7 text-gold-400" />
          {t.security.title}
        </h1>
        <p className="mt-1 text-sm font-semibold text-white/50">
          {t.security.subtitle}
        </p>
        <p className="mt-3 rounded-2xl bg-white/[0.04] px-4 py-3 text-xs font-bold text-white/60 ring-1 ring-white/10">
          {t.security.policy}
        </p>
      </div>

      <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70">
        <h2 className="border-b border-slate-100 px-5 py-4 text-lg font-black text-ink-900">
          {t.security.bannedTitle}
        </h2>
        {bans.length === 0 ? (
          <p className="p-10 text-center text-sm font-semibold text-slate-400">
            {t.security.bannedEmpty}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-extrabold text-slate-400">
                  <th className="px-5 py-4 text-start">{t.security.ip}</th>
                  <th className="px-5 py-4 text-start">{t.security.reason}</th>
                  <th className="px-5 py-4 text-start">
                    {t.security.bannedAt}
                  </th>
                  <th className="px-5 py-4 text-start">{t.security.expires}</th>
                  <th className="px-5 py-4 text-end">{t.security.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bans.map((ban) => (
                  <tr key={ban.ip} className="text-sm">
                    <td className="px-5 py-3 font-mono text-xs font-bold text-ink-900">
                      {ban.ip}
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-600">
                      {t.security.reasons[ban.reason] ?? ban.reason}
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-500">
                      {formatDateTime(ban.at, locale)}
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-500">
                      {ban.until - ban.at > permanentSpan
                        ? t.security.permanent
                        : formatDateTime(ban.until, locale)}
                    </td>
                    <td className="px-5 py-3 text-end">
                      <form action={unbanIpAction} className="inline">
                        <input type="hidden" name="lang" value={locale} />
                        <input type="hidden" name="ip" value={ban.ip} />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-extrabold text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-100"
                        >
                          <ShieldOff className="size-3.5" />
                          {t.security.unban}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70">
        <h2 className="border-b border-slate-100 px-5 py-4 text-lg font-black text-ink-900">
          {t.security.eventsTitle}
        </h2>
        {events.length === 0 ? (
          <p className="p-10 text-center text-sm font-semibold text-slate-400">
            {t.security.eventsEmpty}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {events.map((event, index) => (
              <li
                key={`${event.at}-${index}`}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-sm"
              >
                <span className="min-w-36 font-extrabold text-ink-900">
                  {t.security.eventTypes[event.type] ?? event.type}
                </span>
                <span className="font-mono text-xs font-bold text-slate-600">
                  {event.ip}
                </span>
                {event.username && (
                  <span className="text-xs font-bold text-slate-500">
                    {t.security.user}: {event.username}
                  </span>
                )}
                {event.detail && (
                  <span className="text-xs font-semibold text-slate-400">
                    {event.detail}
                  </span>
                )}
                <span className="ms-auto text-xs font-semibold text-slate-400">
                  {formatDateTime(event.at, locale)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
