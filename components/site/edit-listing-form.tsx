import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Send } from "lucide-react"
import { requestEditAction } from "@/app/[lang]/(site)/account/actions"
import { ImageInput } from "@/components/admin/image-input"
import { VideoInput } from "@/components/admin/video-input"
import type { Dictionary } from "@/lib/dictionaries/types"
import type { Locale } from "@/lib/i18n"
import type { Property } from "@/lib/properties"

const inputCls =
  "w-full rounded-xl border-0 bg-sand-100 px-3.5 py-2.5 text-sm font-semibold text-ink-900 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-brand-600"
const labelCls = "mb-1.5 block text-xs font-extrabold text-slate-500"

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
      <h2 className="mb-5 font-heading text-base font-bold text-ink-900">{title}</h2>
      {children}
    </section>
  )
}

/**
 * Owner-side edit request. Nothing here touches the live listing directly —
 * it becomes a pending revision that an admin approves from the dashboard.
 */
export function EditListingForm({
  locale,
  dict,
  property,
}: {
  locale: Locale
  dict: Dictionary
  property: Property
}) {
  const t = dict.account
  const s = dict.submit

  return (
    <form action={requestEditAction} className="space-y-5">
      <input type="hidden" name="lang" value={locale} />
      <input type="hidden" name="slug" value={property.slug} />

      {/* Honeypot */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] top-auto h-px w-px overflow-hidden opacity-0"
      >
        <label htmlFor="edit-website">Website</label>
        <input
          id="edit-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 p-5 text-white sm:p-6">
        <h2 className="font-heading text-base font-bold">{t.editListing}</h2>
        <p className="mt-1 text-sm font-medium leading-7 text-white/70">
          {t.editSentBody}
        </p>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
        <div className="flex items-center gap-4">
          <span className="relative size-16 shrink-0 overflow-hidden rounded-xl ring-1 ring-slate-200">
            {property.images[0] ? (
              <Image
                src={property.images[0]}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : null}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-extrabold text-ink-900">
              {property.name[locale]}
            </span>
            <span className="block text-xs font-semibold text-slate-400">
              {property.address[locale]}
            </span>
          </span>
        </div>
      </div>

      <Section title={s.listingSection}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="ef-title">
              {s.listingTitle}
            </label>
            <input
              id="ef-title"
              name="title"
              required
              defaultValue={property.name[locale]}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls} htmlFor="ef-price">
              {s.price}
            </label>
            <input
              id="ef-price"
              name="price"
              type="text"
              inputMode="numeric"
              dir="ltr"
              defaultValue={String(property.price)}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls} htmlFor="ef-floor">
              {s.floor}
            </label>
            <input
              id="ef-floor"
              name="floor"
              type="number"
              min={0}
              defaultValue={property.floor ?? ""}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls} htmlFor="ef-area">
              {s.area}
            </label>
            <input
              id="ef-area"
              name="area"
              type="number"
              min={0}
              defaultValue={property.area || ""}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="ef-bedrooms">
              {s.bedrooms}
            </label>
            <input
              id="ef-bedrooms"
              name="bedrooms"
              type="number"
              min={0}
              defaultValue={property.bedrooms || ""}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="ef-bathrooms">
              {s.bathrooms}
            </label>
            <input
              id="ef-bathrooms"
              name="bathrooms"
              type="number"
              min={0}
              defaultValue={property.bathrooms || ""}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="ef-living-rooms">
              {s.livingRooms}
            </label>
            <input
              id="ef-living-rooms"
              name="livingRooms"
              type="number"
              min={0}
              defaultValue={property.livingRooms || ""}
              className={inputCls}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="ef-address">
              {s.address}
            </label>
            <input
              id="ef-address"
              name="address"
              defaultValue={property.address[locale]}
              placeholder={s.addressPlaceholder}
              className={inputCls}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="ef-description">
              {s.description}
            </label>
            <textarea
              id="ef-description"
              name="description"
              required
              rows={6}
              defaultValue={property.description[locale]}
              className={inputCls}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="ef-furnished">
              {s.furnished}
            </label>
            <select
              id="ef-furnished"
              name="furnished"
              defaultValue={property.amenities.includes("furnished") ? "yes" : "no"}
              className={inputCls}
            >
              <option value="no">{dict.common.no}</option>
              <option value="yes">{dict.common.yes}</option>
            </select>
          </div>
        </div>
      </Section>

      <Section title={s.photosSection}>
        <ImageInput
          label={s.photosSection}
          help={s.photosHelp}
          removeLabel={s.removePhoto}
          emptyLabel={s.photosEmpty}
          existing={property.images}
          endpoint="/api/listings/upload"
        />
      </Section>

      <Section title={s.videosSection}>
        <VideoInput
          label={s.videosSection}
          help={s.videosHelp}
          removeLabel={s.removeVideo}
          emptyLabel={s.videosEmpty}
          existing={property.videos ?? []}
          endpoint="/api/listings/videos"
        />
      </Section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/${locale}/account`}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-extrabold text-ink-900 transition hover:border-brand-400"
        >
          <ArrowLeft className="size-4 rtl:-scale-x-100" />
          {dict.common.backToListings}
        </Link>
        <button
          type="submit"
          className="btn-brand inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-extrabold text-white"
        >
          <Send className="size-4" />
          {t.editListing}
        </button>
      </div>
    </form>
  )
}