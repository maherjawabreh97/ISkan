import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"
import { ArrowLeft } from "lucide-react"
import { getSignedInAccount } from "@/lib/account-auth"
import { getListingOwner, isPendingSlug } from "@/lib/accounts"
import { EditListingForm } from "@/components/site/edit-listing-form"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"
import { getStoredProperty } from "@/lib/properties-store"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ lang: string; slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params
  const locale: Locale = hasLocale(lang) ? lang : "ar"
  const dict = await getDictionary(locale)
  return { title: dict.account.editListing, robots: { index: false, follow: false } }
}

export default async function EditListingPage({ params }: PageProps) {
  const { lang, slug } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const dict = await getDictionary(locale)
  const t = dict.account

  const account = await getSignedInAccount()
  if (!account) redirect(`/${locale}/login`)

  // Ownership is the only gate: an advertiser can never reach another
  // advertiser's listing, even by guessing a slug.
  const owner = await getListingOwner(slug)
  if (!owner || owner.ownerId !== account.id || isPendingSlug(slug)) {
    redirect(`/${locale}/account?error=notOwned`)
  }

  const property = await getStoredProperty(slug)
  if (!property) notFound()

  return (
    <div className="bg-sand-50">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <Link
          href={`/${locale}/account`}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-brand-700"
        >
          <ArrowLeft className="size-4 rtl:-scale-x-100" />
          {t.title}
        </Link>
        <h1 className="mt-3 font-heading text-2xl font-bold text-ink-900">
          {t.editListing}
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-7 text-slate-500">
          {t.editSentBody}
        </p>

        <div className="mt-8">
          <EditListingForm locale={locale} dict={dict} property={property} />
        </div>
      </div>
    </div>
  )
}