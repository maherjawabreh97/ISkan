import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import {
  Check,
  Clock,
  ExternalLink,
  Inbox,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react"
import {
  approveSubmissionAction,
  rejectSubmissionAction,
} from "@/app/[lang]/admin/actions"
import { ConfirmSubmit } from "@/components/admin/confirm-submit"
import { getCurrentUser } from "@/lib/auth"
import { getAdminDict } from "@/lib/dictionaries/admin"
import { formatPrice } from "@/lib/format"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"
import { listSubmissions } from "@/lib/submissions-store"
import type { SubmissionStatus } from "@/lib/submissions"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ error?: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang } = await params
  const locale = hasLocale(lang) ? lang : "ar"
  return {
    title: {
      absolute: `${getAdminDict(locale).submissions.title} | Iskan`,
    },
  }
}

function formatDateTime(value: number, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value))
}

const badgeCls: Record<SubmissionStatus, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rejected: "bg-rose-50 text-rose-700 ring-rose-200",
}

export default async function AdminSubmissionsPage({
  params,
  searchParams,
}: PageProps) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const t = getAdminDict(locale)
  const dict = await getDictionary(locale)
  const { error } = await searchParams

  const current = await getCurrentUser()
  if (!current) redirect(`/${locale}/admin/login`)
  if (current.role === "viewer") redirect(`/${locale}/admin`)

  const submissions = await listSubmissions()
  const pending = submissions.filter((item) => item.status === "pending")
  const handled = submissions.filter((item) => item.status !== "pending")

  const statusLabel = (status: SubmissionStatus): string =>
    status === "approved"
      ? t.submissions.statusApproved
      : status === "rejected"
        ? t.submissions.statusRejected
        : t.submissions.statusPending

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">
            {t.submissions.title}
          </h1>
          <p className="mt-1 text-sm font-semibold text-white/50">
            {t.submissions.subtitle}
          </p>
        </div>
        {pending.length > 0 && (
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm font-black text-amber-300">
            <Clock className="size-4" />
            {pending.length}
          </span>
        )}
      </div>

      {error === "notfound" && (
        <div className="rounded-2xl bg-rose-500/10 px-5 py-4 text-sm font-bold text-rose-300 ring-1 ring-rose-500/30">
          {t.submissions.empty}
        </div>
      )}

      {pending.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200/70">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <Inbox className="size-6" />
          </span>
          <h2 className="mt-4 text-lg font-black text-ink-900">
            {t.submissions.empty}
          </h2>
          <p className="mt-1.5 text-sm font-semibold text-slate-400">
            {t.submissions.emptyDesc}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {pending.map((item) => {
            const waNumber = item.phone.replace(/[^0-9]/g, "")
            return (
              <article
                key={item.id}
                className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                      {item.images[0] && (
                        <Image
                          src={item.images[0]}
                          alt={item.title}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ${badgeCls[item.status]}`}
                      >
                        {statusLabel(item.status)}
                      </span>
                      <h2 className="mt-2 text-base font-black text-ink-900">
                        {item.title}
                      </h2>
                      <p className="text-xs font-semibold text-slate-400">
                        {dict.propertyTypes[item.type]} ·{" "}
                        {item.purpose === "rent"
                          ? dict.common.forRent
                          : dict.common.forSale}{" "}
                        · {dict.cities[item.city]}
                      </p>
                      <p className="mt-1 text-sm font-black text-brand-700">
                        {formatPrice(item.price, item.currency)}
                        {item.purpose === "rent" && item.pricePerMonth
                          ? dict.common.perMonth
                          : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-slate-400">
                    {t.submissions.submittedAt}:{" "}
                    {formatDateTime(item.createdAt, locale)}
                  </div>
                </div>

                <dl className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-extrabold text-slate-400">
                      {t.submissions.contact}
                    </dt>
                    <dd className="mt-1.5 text-sm font-bold text-ink-900">
                      {item.contactName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-extrabold text-slate-400">
                      {t.submissions.phone}
                    </dt>
                    <dd className="mt-1.5 flex flex-wrap items-center gap-3 text-sm font-bold">
                      <a
                        href={`tel:${item.phone}`}
                        dir="ltr"
                        className="inline-flex items-center gap-1.5 text-ink-900 hover:text-brand-700"
                      >
                        <Phone className="size-3.5" />
                        {item.phone}
                      </a>
                      {waNumber && (
                        <a
                          href={`https://wa.me/${waNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700"
                        >
                          <MessageCircle className="size-3.5" />
                          WhatsApp
                        </a>
                      )}
                    </dd>
                  </div>
                  {item.email && (
                    <div>
                      <dt className="text-xs font-extrabold text-slate-400">
                        {t.submissions.email}
                      </dt>
                      <dd className="mt-1.5 text-sm font-bold">
                        <a
                          href={`mailto:${item.email}`}
                          dir="ltr"
                          className="inline-flex items-center gap-1.5 text-ink-900 hover:text-brand-700"
                        >
                          <Mail className="size-3.5" />
                          {item.email}
                        </a>
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-xs font-extrabold text-slate-400">
                      {t.submissions.price}
                    </dt>
                    <dd className="mt-1.5 text-sm font-bold text-ink-900">
                      {item.area ? `${item.area} ${dict.common.sqm} · ` : ""}
                      {item.bedrooms} {dict.common.beds} · {item.bathrooms}{" "}
                      {dict.common.baths}
                      {item.floor !== undefined ? ` · ${t.form.floor}: ${item.floor}` : ""}
                      {item.furnished ? ` · ${dict.amenities.furnished}` : ""}
                    </dd>
                  </div>
                  {item.address && (
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-extrabold text-slate-400">
                        {t.submissions.address}
                      </dt>
                      <dd className="mt-1.5 text-sm font-bold text-ink-900">
                        {item.address}
                      </dd>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-extrabold text-slate-400">
                      {t.submissions.description}
                    </dt>
                    <dd className="mt-1.5 whitespace-pre-line text-sm font-semibold leading-relaxed text-slate-600">
                      {item.description}
                    </dd>
                  </div>
                </dl>

                {item.images.length > 0 && (
                  <div className="mt-5 border-t border-slate-100 pt-5">
                    <p className="mb-3 text-xs font-extrabold text-slate-400">
                      {t.submissions.photos} ({item.images.length})
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {item.images.slice(0, 8).map((url) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative size-20 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200 transition hover:ring-brand-400"
                        >
                          <Image
                            src={url}
                            alt=""
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                  <form action={approveSubmissionAction}>
                    <input type="hidden" name="lang" value={locale} />
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      className="btn-gold inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-black text-ink-950 transition hover:brightness-105"
                    >
                      <Check className="size-4" />
                      {t.submissions.approve}
                    </button>
                  </form>
                  <form action={rejectSubmissionAction}>
                    <input type="hidden" name="lang" value={locale} />
                    <input type="hidden" name="id" value={item.id} />
                    <ConfirmSubmit
                      message={t.submissions.confirmReject}
                      label={t.submissions.reject}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-black text-rose-600 transition hover:border-rose-200 hover:bg-rose-50"
                    />
                  </form>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {handled.length > 0 && (
        <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-start">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-extrabold text-slate-400">
                  <th className="px-5 py-4 text-start">
                    {t.submissions.listing}
                  </th>
                  <th className="px-5 py-4 text-start">
                    {t.common.status}
                  </th>
                  <th className="px-5 py-4 text-start">
                    {t.submissions.submittedAt}
                  </th>
                  <th className="px-5 py-4 text-end">
                    {t.common.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {handled.map((item) => (
                  <tr key={item.id} className="text-sm">
                    <td className="px-5 py-3">
                      <p className="max-w-[320px] truncate font-extrabold text-ink-900">
                        {item.title}
                      </p>
                      <p className="text-xs font-semibold text-slate-400">
                        {item.contactName} · {dict.cities[item.city]}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ${badgeCls[item.status]}`}
                      >
                        {statusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs font-semibold text-slate-400">
                      {formatDateTime(item.createdAt, locale)}
                    </td>
                    <td className="px-5 py-3 text-end">
                      {item.reviewedSlug ? (
                        <Link
                          href={`/${locale}/admin/properties/${item.reviewedSlug}`}
                          className="inline-flex items-center gap-1.5 text-xs font-black text-brand-700 hover:underline"
                        >
                          <ExternalLink className="size-3.5" />
                          {t.submissions.openProperty}
                        </Link>
                      ) : (
                        <span className="text-xs font-semibold text-slate-300">
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
