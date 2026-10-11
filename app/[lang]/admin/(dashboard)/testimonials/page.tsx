import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { Check, Clock, Inbox } from "lucide-react"
import {
  approveTestimonialAction,
  deleteTestimonialAction,
} from "@/app/[lang]/admin/actions"
import { ConfirmSubmit } from "@/components/admin/confirm-submit"
import { getCurrentUser } from "@/lib/auth"
import { getAdminDict } from "@/lib/dictionaries/admin"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"
import { listTestimonials } from "@/lib/testimonials-store"
import type { TestimonialStatus } from "@/lib/testimonials"

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
      absolute: `${getAdminDict(locale).testimonials.title} | Iskan`,
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

const badgeCls: Record<TestimonialStatus, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
}

export default async function AdminTestimonialsPage({
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

  const testimonials = await listTestimonials()
  const pending = testimonials.filter((item) => item.status === "pending")
  const approved = testimonials.filter((item) => item.status === "approved")

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">
            {t.testimonials.title}
          </h1>
          <p className="mt-1 text-sm font-semibold text-white/50">
            {t.testimonials.subtitle}
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
          {t.testimonials.notFound}
        </div>
      )}

      {pending.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200/70">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <Inbox className="size-6" />
          </span>
          <h2 className="mt-4 text-lg font-black text-ink-900">
            {t.testimonials.empty}
          </h2>
          <p className="mt-1.5 text-sm font-semibold text-slate-400">
            {t.testimonials.emptyDesc}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {pending.map((item) => (
            <article
              key={item.id}
              className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-black text-white">
                    {item.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ${badgeCls[item.status]}`}
                    >
                      {t.testimonials.statusPending}
                    </span>
                    <h2 className="mt-2 text-base font-black text-ink-900">
                      {item.name}
                    </h2>
                    {item.role && (
                      <p className="text-xs font-semibold text-slate-400">
                        {item.role}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-xs font-semibold text-slate-400">
                  {t.testimonials.submittedAt}:{" "}
                  {formatDateTime(item.createdAt, locale)}
                </p>
              </div>

              <blockquote className="mt-4 border-t border-slate-100 pt-4 text-sm font-semibold leading-relaxed text-slate-600">
                “{item.text}”
              </blockquote>

              <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                <form action={approveTestimonialAction}>
                  <input type="hidden" name="lang" value={locale} />
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    type="submit"
                    className="btn-gold inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-black text-ink-950 transition hover:brightness-105"
                  >
                    <Check className="size-4" />
                    {t.testimonials.approve}
                  </button>
                </form>
                <form action={deleteTestimonialAction}>
                  <input type="hidden" name="lang" value={locale} />
                  <input type="hidden" name="id" value={item.id} />
                  <ConfirmSubmit
                    message={t.testimonials.confirmDelete}
                    label={t.testimonials.delete}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-black text-rose-600 transition hover:border-rose-200 hover:bg-rose-50"
                  />
                </form>
              </div>
            </article>
          ))}
        </div>
      )}

      {approved.length > 0 && (
        <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-start">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-extrabold text-slate-400">
                  <th className="px-5 py-4 text-start">
                    {t.testimonials.review}
                  </th>
                  <th className="px-5 py-4 text-start">
                    {t.common.status}
                  </th>
                  <th className="px-5 py-4 text-start">
                    {t.testimonials.submittedAt}
                  </th>
                  <th className="px-5 py-4 text-end">
                    {t.common.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {approved.map((item) => (
                  <tr key={item.id} className="text-sm">
                    <td className="px-5 py-3">
                      <p className="max-w-[320px] truncate font-extrabold text-ink-900">
                        {item.name}
                      </p>
                      <p className="text-xs font-semibold text-slate-400">
                        {item.role || dict.testimonials.empty}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ${badgeCls[item.status]}`}
                      >
                        {t.testimonials.statusApproved}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs font-semibold text-slate-400">
                      {formatDateTime(item.createdAt, locale)}
                    </td>
                    <td className="px-5 py-3 text-end">
                      <form action={deleteTestimonialAction}>
                        <input type="hidden" name="lang" value={locale} />
                        <input type="hidden" name="id" value={item.id} />
                        <ConfirmSubmit
                          message={t.testimonials.confirmDelete}
                          label={t.common.delete}
                          className="inline-flex items-center gap-1.5 text-xs font-black text-rose-600 hover:underline"
                        />
                      </form>
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
