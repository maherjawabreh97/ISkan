import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import {
  BadgeCheck,
  Ban,
  CheckCircle2,
  Flag,
  ShieldOff,
} from "lucide-react"
import {
  approveRevisionAction,
  deleteAccountAction,
  rejectRevisionAction,
  resolveReportAction,
  setAccountStatusAction,
} from "@/app/[lang]/admin/actions"
import { ConfirmSubmit } from "@/components/admin/confirm-submit"
import {
  listAccounts,
  listOwnerListings,
  listReports,
  listRevisions,
  type AccountStatus,
} from "@/lib/accounts"
import { getCurrentUser } from "@/lib/auth"
import { getAdminDict } from "@/lib/dictionaries/admin"
import { hasLocale, type Locale } from "@/lib/i18n"
import { getStoredProperty } from "@/lib/properties-store"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ tab?: string; error?: string }>
}

const TABS = ["accounts", "revisions", "reports"] as const
type Tab = (typeof TABS)[number]

function dateOf(value?: number): string {
  if (!value) return "—"
  return new Date(value).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export default async function AdminAccountsPage({ params, searchParams }: PageProps) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const t = getAdminDict(locale)
  const a = t.accounts

  const current = await getCurrentUser()
  if (!current) redirect(`/${locale}/admin/login`)
  if (current.role !== "admin") redirect(`/${locale}/admin`)

  const query = await searchParams
  const tab: Tab = TABS.includes(query.tab as Tab) ? (query.tab as Tab) : "accounts"

  const [accounts, revisions, reports] = await Promise.all([
    listAccounts(),
    listRevisions(),
    listReports(),
  ])

  const tabs: Array<{ key: Tab; label: string; count: number }> = [
    { key: "accounts", label: a.tabAccounts, count: accounts.length },
    { key: "revisions", label: a.tabRevisions, count: revisions.length },
    { key: "reports", label: a.tabReports, count: reports.length },
  ]

  const statusPill: Record<AccountStatus, string> = {
    active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    pending_verification: "bg-amber-50 text-amber-700 ring-amber-200",
    suspended: "bg-rose-50 text-rose-700 ring-rose-200",
  }
  const statusLabel: Record<AccountStatus, string> = {
    active: a.statusActive,
    pending_verification: a.statusPending,
    suspended: a.statusSuspended,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">{a.title}</h1>
        <p className="mt-1 text-sm font-semibold text-white/50">{a.subtitle}</p>
        <p className="mt-3 max-w-3xl rounded-2xl bg-brand-500/10 px-4 py-3 text-xs font-semibold leading-6 text-brand-200 ring-1 ring-brand-400/20">
          {a.separationNote}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <Link
            key={item.key}
            href={`/${locale}/admin/accounts?tab=${item.key}`}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold transition ${
              tab === item.key
                ? "bg-gold-400 text-ink-950"
                : "bg-white/[0.06] text-white/70 ring-1 ring-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            {item.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[11px] ${
                tab === item.key ? "bg-ink-950/15" : "bg-white/10"
              }`}
            >
              {item.count}
            </span>
          </Link>
        ))}
      </div>

      {query.error && (
        <p className="rounded-2xl bg-rose-500/15 px-4 py-3 text-sm font-bold text-rose-200 ring-1 ring-rose-400/30">
          {query.error === "notfound" ? t.errors.notFound : "—"}
        </p>
      )}

      {/* ---------------------------------------------- accounts --------- */}
      {tab === "accounts" && (
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
          {accounts.length === 0 ? (
            <p className="py-10 text-center text-sm font-semibold text-slate-400">
              {a.empty}
            </p>
          ) : (
            <div className="space-y-3">
              {await Promise.all(
                accounts.map(async (account) => {
                  const owned = await listOwnerListings(account.id)
                  return (
                    <div
                      key={account.id}
                      className="rounded-2xl bg-sand-50 p-4 ring-1 ring-slate-200/70"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-black text-ink-900">
                            {account.name}
                            <span className="ms-2 font-bold text-slate-400">
                              {account.fullName}
                            </span>
                          </p>
                          <p dir="ltr" className="mt-0.5 text-xs font-bold text-brand-700">
                            {account.email ?? account.phone}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            {a.gender}: {account.gender || "—"} · {a.nationality}:{" "}
                            {account.nationality || "—"} · {a.joined}:{" "}
                            {dateOf(account.createdAt)} · {a.lastLogin}:{" "}
                            {account.lastLoginAt ? dateOf(account.lastLoginAt) : a.never}
                          </p>
                        </div>

                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold ring-1 ${statusPill[account.status]}`}
                          >
                            {account.status === "active" ? (
                              <BadgeCheck className="size-3" />
                            ) : account.status === "suspended" ? (
                              <ShieldOff className="size-3" />
                            ) : (
                              <CheckCircle2 className="size-3" />
                            )}
                            {statusLabel[account.status]}
                          </span>
                          {account.hasOpenCode && (
                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-extrabold text-amber-700 ring-1 ring-amber-200">
                              {a.verificationOpen}
                              {account.pendingCode ? (
                                <span dir="ltr" className="ms-1.5 tracking-[0.15em]">
                                  {account.pendingCode}
                                </span>
                              ) : null}
                            </span>
                          )}
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-extrabold text-slate-600">
                            {owned.length} {a.listingsOwned}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <form action={setAccountStatusAction}>
                          <input type="hidden" name="lang" value={locale} />
                          <input type="hidden" name="id" value={account.id} />
                          <input
                            type="hidden"
                            name="status"
                            value={account.status === "suspended" ? "active" : "suspended"}
                          />
                          <button
                            type="submit"
                            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-extrabold transition ${
                              account.status === "suspended"
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                            }`}
                          >
                            {account.status === "suspended" ? (
                              <BadgeCheck className="size-3.5" />
                            ) : (
                              <Ban className="size-3.5" />
                            )}
                            {account.status === "suspended" ? a.restore : a.suspend}
                          </button>
                        </form>
                        <form action={deleteAccountAction}>
                          <input type="hidden" name="lang" value={locale} />
                          <input type="hidden" name="id" value={account.id} />
                          <ConfirmSubmit
                            message={a.eraseConfirm}
                            label={a.erase}
                            className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-slate-200"
                          />
                        </form>
                      </div>
                    </div>
                  )
                }),
              )}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------- revisions -------- */}
      {tab === "revisions" && (
        <div className="space-y-4">
          <p className="rounded-2xl bg-brand-500/10 px-4 py-3 text-xs font-semibold leading-6 text-brand-200 ring-1 ring-brand-400/20">
            {a.revisionsHint}
          </p>

          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
            <h2 className="mb-4 text-lg font-black text-ink-900">
              {a.revisionsTitle}
            </h2>
            {revisions.length === 0 ? (
              <p className="py-10 text-center text-sm font-semibold text-slate-400">
                {a.revisionsEmpty}
              </p>
            ) : (
              <div className="space-y-4">
                {await Promise.all(
                  revisions.map(async (revision) => {
                    const property = await getStoredProperty(revision.slug)
                    const patch = revision.data as Record<string, unknown>
                    return (
                      <div
                        key={revision.id}
                        className="rounded-2xl bg-sand-50 p-4 ring-1 ring-slate-200/70"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <Link
                            href={`/${locale}/admin/properties/${revision.slug}`}
                            className="text-sm font-black text-ink-900 underline-offset-2 hover:underline"
                          >
                            {property?.name[locale] ?? revision.slug}
                          </Link>
                          <span className="text-[11px] font-bold text-slate-400">
                            {dateOf(revision.createdAt)}
                          </span>
                        </div>

                        <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                          {Object.entries(patch).map(([key, value]) => (
                            <div
                              key={key}
                              className="flex gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200/70"
                            >
                              <dt className="shrink-0 font-extrabold text-slate-500">
                                {key}
                              </dt>
                              <dd className="min-w-0 break-words font-bold text-ink-900">
                                {Array.isArray(value)
                                  ? `${value.length} file(s)`
                                  : String(value).slice(0, 220)}
                              </dd>
                            </div>
                          ))}
                        </dl>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <form action={approveRevisionAction}>
                            <input type="hidden" name="lang" value={locale} />
                            <input type="hidden" name="id" value={revision.id} />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white transition hover:bg-emerald-700"
                            >
                              <BadgeCheck className="size-3.5" />
                              {a.approve}
                            </button>
                          </form>
                          <form action={rejectRevisionAction}>
                            <input type="hidden" name="lang" value={locale} />
                            <input type="hidden" name="id" value={revision.id} />
                            <ConfirmSubmit
                              message={t.common.confirmDelete}
                              label={a.reject}
                              className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-slate-200"
                            />
                          </form>
                        </div>
                      </div>
                    )
                  }),
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------- reports --------- */}
      {tab === "reports" && (
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
          <h2 className="mb-4 text-lg font-black text-ink-900">{a.reportsTitle}</h2>
          {reports.length === 0 ? (
            <p className="py-10 text-center text-sm font-semibold text-slate-400">
              {a.reportsEmpty}
            </p>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="rounded-2xl bg-sand-50 p-4 ring-1 ring-slate-200/70"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="inline-flex items-center gap-1.5 text-sm font-black text-ink-900">
                        <Flag className="size-3.5 text-rose-500" />
                        {a.reason}: {report.reason}
                      </p>
                      {report.details && (
                        <p className="mt-1 text-xs font-semibold leading-6 text-slate-600">
                          {report.details}
                        </p>
                      )}
                      <p className="mt-1 text-xs font-semibold text-slate-400">
                        {a.reporter}:{" "}
                        {report.reporterName || report.reporterEmail || "—"} ·{" "}
                        {a.target}: {report.targetName ?? report.targetUserId} ·{" "}
                        {dateOf(report.createdAt)}
                      </p>
                    </div>
                    <form action={resolveReportAction}>
                      <input type="hidden" name="lang" value={locale} />
                      <input type="hidden" name="id" value={report.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-slate-200"
                      >
                        <CheckCircle2 className="size-3.5" />
                        {a.resolve}
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}