import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import {
  BadgeCheck,
  Building2,
  Clock,
  LogOut,
  Pencil,
  Plus,
} from "lucide-react"
import { ConfirmSubmit } from "@/components/admin/confirm-submit"
import {
  logoutAction,
  removeOwnListingAction,
  updateProfileAction,
} from "@/app/[lang]/(site)/account/actions"
import { getSignedInAccount } from "@/lib/account-auth"
import {
  isPendingSlug,
  listOwnerListings,
  submissionIdFromSlug,
  type ListingState,
} from "@/lib/accounts"
import { formatPrice } from "@/lib/format"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"
import { getStoredProperty } from "@/lib/properties-store"
import { getSubmission } from "@/lib/submissions-store"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ lang: string }>
  searchParams: Promise<{
    posted?: string
    edit?: string
    removed?: string
    saved?: string
    error?: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params
  const locale: Locale = hasLocale(lang) ? lang : "ar"
  const dict = await getDictionary(locale)
  return { title: dict.account.title, robots: { index: false, follow: false } }
}

  "w-full rounded-xl border-0 bg-sand-100 px-3.5 py-2.5 text-sm font-semibold text-ink-900 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-brand-600"

function stateBadge(state: ListingState, t: Awaited<ReturnType<typeof getDictionary>>["account"]) {
  const map = {
    pending_review: {
      label: t.statusPending,
      className: "bg-amber-50 text-amber-700 ring-amber-200",
      Icon: Clock,
    },
    published: {
      label: t.statusPublished,
      className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      Icon: BadgeCheck,
    },
    changes_pending: {
      label: t.statusChanges,
      className: "bg-brand-50 text-brand-700 ring-brand-200",
      Icon: Pencil,
    },
  } as const
  return map[state] ?? map.pending_review
}

export default async function AccountPage({ params, searchParams }: PageProps) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const dict = await getDictionary(locale)
  const t = dict.account

  const account = await getSignedInAccount()
  const query = await searchParams

  if (!account) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
        <h1 className="font-heading text-2xl font-bold text-ink-900">
          {t.title}
        </h1>
        <p className="mt-3 text-sm font-semibold leading-7 text-slate-500">
          {t.errorForbidden}
        </p>
        <Link
          href={`/${locale}/login`}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-ink-900 px-7 py-3.5 text-sm font-extrabold text-white"
        >
          {t.loginButton}
        </Link>
      </div>
    )
  }

  const owned = await listOwnerListings(account.id)

  const errorMessages: Record<string, string> = {
    notOwned: t.errorNotOwned,
    noChange: t.errorNoChange,
    required: t.errorRequired,
    rate: t.errorRate,
  }
  const errorMessage = query.error ? errorMessages[query.error] : undefined

  return (
    <div className="bg-sand-50">
      <section className="bg-gradient-to-br from-ink-950 via-ink-900 to-brand-900 px-4 py-10 text-white sm:px-6 sm:py-12">
        <div className="relative mx-auto max-w-4xl">
          <p className="text-sm font-bold text-gold-300">{t.signedInAs}</p>
          <h1 className="mt-1 font-heading text-2xl font-bold sm:text-3xl">
            {account.name}
          </h1>
          <p className="mt-2 text-sm font-medium text-white/70">{t.subtitle}</p>

          <form action={updateProfileAction} className="mt-6 space-y-3">
            <input type="hidden" name="lang" value={locale} />
            <input type="hidden" name="website" value="" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label
                  className="mb-1.5 block text-[11px] font-extrabold text-white/60"
                  htmlFor="ac-name"
                >
                  {t.name}
                </label>
                <input
                  id="ac-name"
                  name="name"
                  required
                  defaultValue={account.name}
                  className="w-full rounded-xl border-0 bg-white/10 px-3.5 py-2.5 text-sm font-bold text-white outline-none ring-1 ring-white/15 placeholder:text-white/40 focus:ring-2 focus:ring-gold-400"
                />
              </div>
              <div>
                <label
                  className="mb-1.5 block text-[11px] font-extrabold text-white/60"
                  htmlFor="ac-fullname"
                >
                  {t.fullName}
                </label>
                <input
                  id="ac-fullname"
                  name="fullName"
                  required
                  defaultValue={account.fullName}
                  className="w-full rounded-xl border-0 bg-white/10 px-3.5 py-2.5 text-sm font-bold text-white outline-none ring-1 ring-white/15 focus:ring-2 focus:ring-gold-400"
                />
              </div>
              <div>
                <label
                  className="mb-1.5 block text-[11px] font-extrabold text-white/60"
                  htmlFor="ac-gender"
                >
                  {t.gender}
                </label>
                <select
                  id="ac-gender"
                  name="gender"
                  defaultValue={account.gender || t.choose}
                  className="w-full rounded-xl border-0 bg-white/10 px-3.5 py-2.5 text-sm font-bold text-white outline-none ring-1 ring-white/15 focus:ring-2 focus:ring-gold-400"
                >
                  <option value={t.choose} className="text-ink-900">
                    {t.choose}
                  </option>
                  {t.genderOptions.map((option) => (
                    <option key={option} value={option} className="text-ink-900">
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="mb-1.5 block text-[11px] font-extrabold text-white/60"
                  htmlFor="ac-nationality"
                >
                  {t.nationality}
                </label>
                <input
                  id="ac-nationality"
                  name="nationality"
                  defaultValue={account.nationality}
                  className="w-full rounded-xl border-0 bg-white/10 px-3.5 py-2.5 text-sm font-bold text-white outline-none ring-1 ring-white/15 focus:ring-2 focus:ring-gold-400"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="submit"
                className="rounded-full bg-gold-400 px-5 py-2.5 text-xs font-extrabold text-ink-950 transition hover:brightness-105"
              >
                {dict.common.save}
              </button>
              <span dir="ltr" className="text-xs font-bold text-white/50">
                {account.email ?? account.phone}
              </span>
            </div>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        {errorMessage && (
          <p className="mb-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-200">
            {errorMessage}
          </p>
        )}
        {query.saved && (
          <p className="mb-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200">
            {dict.common.saved}
          </p>
        )}
        {query.removed && (
          <p className="mb-5 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600 ring-1 ring-slate-200">
            {t.removeListing} ✓
          </p>
        )}
        {query.posted && (
          <p className="mb-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200">
            {dict.submit.successTitle} — {dict.submit.successBody}
          </p>
        )}
        {query.edit && (
          <p className="mb-5 rounded-xl bg-brand-50 px-4 py-3 text-sm font-bold text-brand-700 ring-1 ring-brand-200">
            {t.editSent} — {t.editSentBody}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-bold text-ink-900">
            {t.myListings}
          </h2>
          <Link
            href={`/${locale}/submit`}
            className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-xs font-extrabold text-white transition hover:bg-ink-800"
          >
            <Plus className="size-4" />
            {t.addListing}
          </Link>
        </div>

        {owned.length === 0 ? (
          <div className="mt-4 rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200/70">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              <Building2 className="size-6" />
            </span>
            <p className="mt-4 text-sm font-extrabold text-ink-900">
              {t.noListings}
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm font-semibold leading-7 text-slate-500">
              {t.noListingsDesc}
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {await Promise.all(
              owned.map(async (item) => {
                const pending = isPendingSlug(item.slug)
                const property = pending ? null : await getStoredProperty(item.slug)
                const submission = pending
                  ? await getSubmission(submissionIdFromSlug(item.slug))
                  : null
                const badge = stateBadge(item.state, t)
                const title =
                  property?.name[locale] ?? submission?.title ?? item.slug
                const price = property?.price ?? submission?.price ?? 0
                const currency = property?.currency ?? submission?.currency ?? "TRY"

                return (
                  <li
                    key={item.slug}
                    className="flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 sm:flex-row sm:items-center"
                  >
                    <span className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-sand-100 ring-1 ring-slate-200">
                      {property?.images[0] || submission?.images[0] ? (
                        <Image
                          src={(property?.images[0] ?? submission?.images[0]) as string}
                          alt=""
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      ) : null}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-extrabold text-ink-900">
                        {title}
                      </p>
                      <p className="mt-0.5 text-sm font-black text-brand-700">
                        {formatPrice(price, currency)}
                      </p>
                      <span
                        className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold ring-1 ${badge.className}`}
                      >
                        <badge.Icon className="size-3" />
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {property && (
                        <>
                          <Link
                            href={`/${locale}/properties/${property.slug}`}
                            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-extrabold text-ink-900 transition hover:border-brand-400"
                          >
                            {t.viewListing}
                          </Link>
                          <Link
                            href={`/${locale}/account/edit/${property.slug}`}
                            className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-2 text-xs font-extrabold text-brand-700 transition hover:bg-brand-100"
                          >
                            <Pencil className="size-3.5" />
                            {t.editListing}
                          </Link>
                        </>
                      )}
                      <form action={removeOwnListingAction}>
                        <input type="hidden" name="lang" value={locale} />
                        <input type="hidden" name="slug" value={item.slug} />
                        <ConfirmSubmit
                          message={t.removeConfirm}
                          label={t.removeListing}
                          className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-4 py-2 text-xs font-extrabold text-rose-700 transition hover:bg-rose-100"
                        />
                      </form>
                    </div>
                  </li>
                )
              }),
            )}
          </ul>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6">
          <Link
            href={`/${locale}/register`}
            className="text-xs font-bold text-slate-400 transition hover:text-brand-700"
          >
            {dict.manage.badge}
          </Link>
          <div className="flex items-center gap-2">
            <form action={logoutAction}>
              <input type="hidden" name="lang" value={locale} />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-extrabold text-ink-900"
              >
                <LogOut className="size-3.5" />
                {t.logout}
              </button>
            </form>
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-xs font-extrabold text-white"
            >
              {t.backHome}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}