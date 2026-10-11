import Link from "next/link"
import { Send } from "lucide-react"
import { submitListingAction } from "@/app/[lang]/(site)/submit/actions"
import { ImageInput } from "@/components/admin/image-input"
import type {
  CityKey,
  Dictionary,
  PropertyTypeKey,
} from "@/lib/dictionaries/types"
import type { Locale } from "@/lib/i18n"

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
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
      <h2 className="mb-5 text-lg font-black text-ink-900">{title}</h2>
      {children}
    </section>
  )
}

export function SubmitForm({
  locale,
  dict,
}: {
  locale: Locale
  dict: Dictionary
}) {
  const t = dict.submit

  return (
    <form action={submitListingAction} className="space-y-5">
      <input type="hidden" name="lang" value={locale} />

      {/* Honeypot: hidden from humans, irresistible to bots. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] top-auto h-px w-px overflow-hidden opacity-0"
      >
        <label htmlFor="submit-website">Website</label>
        <input
          id="submit-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 p-5 text-white sm:p-6">
        <h2 className="text-lg font-black">{t.formTitle}</h2>
        <p className="mt-1 text-sm font-semibold text-white/70">
          {t.subtitle}
        </p>
      </div>

      <Section title={t.contactSection}>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls} htmlFor="sf-name">
              {t.name}
            </label>
            <input
              id="sf-name"
              name="contactName"
              required
              autoComplete="name"
              placeholder={t.namePlaceholder}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="sf-phone">
              {t.phone}
            </label>
            <input
              id="sf-phone"
              name="phone"
              required
              inputMode="tel"
              dir="ltr"
              autoComplete="tel"
              placeholder={t.phonePlaceholder}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="sf-email">
              {t.email}{" "}
              <span className="font-bold text-slate-400">
                ({t.emailOptional})
              </span>
            </label>
            <input
              id="sf-email"
              name="email"
              type="email"
              dir="ltr"
              autoComplete="email"
              className={inputCls}
            />
          </div>
        </div>
      </Section>

      <Section title={t.listingSection}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="sf-title">
              {t.listingTitle}
            </label>
            <input
              id="sf-title"
              name="title"
              required
              placeholder={t.listingTitlePlaceholder}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls} htmlFor="sf-purpose">
              {t.purpose}
            </label>
            <select id="sf-purpose" name="purpose" className={inputCls} defaultValue="rent">
              <option value="rent">{dict.common.forRent}</option>
              <option value="sale">{dict.common.forSale}</option>
            </select>
          </div>

          <div>
            <label className={labelCls} htmlFor="sf-type">
              {t.propertyType}
            </label>
            <select id="sf-type" name="type" className={inputCls} defaultValue="apartment">
              {(Object.keys(dict.propertyTypes) as PropertyTypeKey[]).map(
                (key) => (
                  <option key={key} value={key}>
                    {dict.propertyTypes[key]}
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label className={labelCls} htmlFor="sf-city">
              {t.city}
            </label>
            <select id="sf-city" name="city" className={inputCls} defaultValue="kayashehir">
              {(Object.keys(dict.cities) as CityKey[]).map((key) => (
                <option key={key} value={key}>
                  {dict.cities[key]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls} htmlFor="sf-price">
              {t.price}
            </label>
            <div className="flex gap-2">
              <input
                id="sf-price"
                name="price"
                type="number"
                min={0}
                step="any"
                placeholder="0"
                className={inputCls}
              />
              <select
                name="currency"
                aria-label={t.currency}
                defaultValue="TRY"
                className={`${inputCls} max-w-32`}
              >
                <option value="TRY">₺ TRY</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
              </select>
            </div>
            <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-500">
              <input
                type="checkbox"
                name="pricePerMonth"
                defaultChecked
                className="size-3.5 accent-brand-600"
              />
              {t.pricePerMonth}
            </label>
          </div>

          <div>
            <label className={labelCls} htmlFor="sf-area">
              {t.area}
            </label>
            <input
              id="sf-area"
              name="area"
              type="number"
              min={0}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="sf-bedrooms">
              {t.bedrooms}
            </label>
            <input
              id="sf-bedrooms"
              name="bedrooms"
              type="number"
              min={0}
              defaultValue={1}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="sf-bathrooms">
              {t.bathrooms}
            </label>
            <input
              id="sf-bathrooms"
              name="bathrooms"
              type="number"
              min={0}
              defaultValue={1}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="sf-floor">
              {t.floor}
            </label>
            <input
              id="sf-floor"
              name="floor"
              type="number"
              className={inputCls}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="flex cursor-pointer items-center gap-2.5 rounded-xl bg-sand-100 px-3.5 py-2.5 text-sm font-bold text-ink-900 ring-1 ring-slate-200">
              <input
                type="checkbox"
                name="furnished"
                className="size-4 accent-brand-600"
              />
              {t.furnished}
            </label>
          </div>

          <div className="sm:col-span-2">
            <label className="flex cursor-pointer items-center gap-2.5 rounded-xl bg-sand-100 px-3.5 py-2.5 text-sm font-bold text-ink-900 ring-1 ring-slate-200">
              <input
                type="text"
                name="address"
                placeholder={t.addressPlaceholder}
                className={inputCls}
              />
            </label>
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="sf-description">
              {t.description}
            </label>
            <textarea
              id="sf-description"
              name="description"
              required
              rows={5}
              placeholder={t.descriptionPlaceholder}
              className={inputCls}
            />
          </div>
        </div>
      </Section>

      <Section title={t.photosSection}>
        <ImageInput
          label={t.photosSection}
          help={t.photosHelp}
          removeLabel={t.removePhoto}
          emptyLabel={t.photosEmpty}
          endpoint="/api/listings/upload"
        />
      </Section>

      <label className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3.5 text-xs font-semibold leading-relaxed text-slate-500 ring-1 ring-slate-200/70">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-0.5 size-4 shrink-0 accent-brand-600"
        />
        <span>
          {t.consent}{" "}
          <Link
            href={`/${locale}/privacy`}
            className="font-extrabold text-brand-700 underline underline-offset-2"
          >
            {t.privacyLink}
          </Link>
        </span>
      </label>

      <button
        type="submit"
        className="btn-brand inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-extrabold text-white sm:w-auto"
      >
        <Send className="size-4" />
        {t.submitButton}
      </button>
    </form>
  )
}