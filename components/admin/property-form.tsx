import Link from "next/link"
import { savePropertyAction } from "@/app/[lang]/admin/actions"
import { ImageInput } from "@/components/admin/image-input"
import type { AdminDict } from "@/lib/dictionaries/admin"
import type {
  AmenityKey,
  Dictionary,
  PropertyTypeKey,
  CityKey,
} from "@/lib/dictionaries/types"
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
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
      <h2 className="mb-5 text-lg font-black text-ink-900">{title}</h2>
      {children}
    </section>
  )
}

export function PropertyForm({
  locale,
  dict,
  t,
  property,
}: {
  locale: Locale
  dict: Dictionary
  t: AdminDict
  property?: Property
}) {
  const isEdit = Boolean(property)

  return (
    <form action={savePropertyAction} className="space-y-6">
      <input type="hidden" name="lang" value={locale} />
      {property && (
        <input type="hidden" name="originalSlug" value={property.slug} />
      )}

      <Section title={t.form.basicSection}>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls} htmlFor="pf-purpose">
              {t.form.purpose}
            </label>
            <select
              id="pf-purpose"
              name="purpose"
              defaultValue={property?.purpose ?? "rent"}
              className={inputCls}
            >
              <option value="sale">{dict.common.forSale}</option>
              <option value="rent">{dict.common.forRent}</option>
            </select>
          </div>

          <div>
            <label className={labelCls} htmlFor="pf-type">
              {t.form.propertyType}
            </label>
            <select
              id="pf-type"
              name="type"
              defaultValue={property?.type ?? "apartment"}
              className={inputCls}
            >
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
            <label className={labelCls} htmlFor="pf-city">
              {t.form.city}
            </label>
            <select
              id="pf-city"
              name="city"
              defaultValue={property?.city ?? "kayashehir"}
              className={inputCls}
            >
              {(Object.keys(dict.cities) as CityKey[]).map((key) => (
                <option key={key} value={key}>
                  {dict.cities[key]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      <Section title={t.form.pricingSection}>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls} htmlFor="pf-price">
              {t.form.price}
            </label>
            <input
              id="pf-price"
              name="price"
              type="number"
              min={0}
              step="any"
              defaultValue={property?.price ?? ""}
              className={inputCls}
              placeholder="0"
            />
          </div>

          <div>
            <label className={labelCls} htmlFor="pf-currency">
              {t.form.currency}
            </label>
            <select
              id="pf-currency"
              name="currency"
              defaultValue={property?.currency ?? "TRY"}
              className={inputCls}
            >
              <option value="TRY">TRY — ₺</option>
              <option value="USD">USD — $</option>
              <option value="EUR">EUR — €</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl bg-sand-100 px-3.5 py-2.5 text-sm font-bold text-ink-900 ring-1 ring-slate-200">
              <input
                type="checkbox"
                name="pricePerMonth"
                defaultChecked={property?.pricePerMonth ?? true}
                className="size-4 accent-brand-600"
              />
              {t.form.pricePerMonth}
            </label>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm font-bold text-ink-900">
            <input
              type="checkbox"
              name="citizenshipEligible"
              defaultChecked={property?.citizenshipEligible ?? false}
              className="size-4 accent-brand-600"
            />
            {t.form.citizenshipEligible}
          </label>
          <span className="text-xs font-semibold text-slate-400">
            {t.form.citizenshipHint}
          </span>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm font-bold text-ink-900">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={property?.featured ?? false}
              className="size-4 accent-brand-600"
            />
            {t.form.featured}
          </label>
        </div>
      </Section>

      <Section title={t.form.detailsSection}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={labelCls} htmlFor="pf-bedrooms">
              {t.form.bedrooms}
            </label>
            <input
              id="pf-bedrooms"
              name="bedrooms"
              type="number"
              min={0}
              defaultValue={property?.bedrooms ?? 0}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="pf-bathrooms">
              {t.form.bathrooms}
            </label>
            <input
              id="pf-bathrooms"
              name="bathrooms"
              type="number"
              min={0}
              defaultValue={property?.bathrooms ?? 0}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="pf-area">
              {t.form.area}
            </label>
            <input
              id="pf-area"
              name="area"
              type="number"
              min={0}
              defaultValue={property?.area ?? ""}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="pf-netArea">
              {t.form.netArea}
            </label>
            <input
              id="pf-netArea"
              name="netArea"
              type="number"
              min={0}
              defaultValue={property?.netArea ?? ""}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="pf-parking">
              {t.form.parking}
            </label>
            <input
              id="pf-parking"
              name="parking"
              type="number"
              min={0}
              defaultValue={property?.parking ?? 0}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="pf-yearBuilt">
              {t.form.yearBuilt}
            </label>
            <input
              id="pf-yearBuilt"
              name="yearBuilt"
              type="number"
              min={0}
              defaultValue={property?.yearBuilt ?? ""}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="pf-floor">
              {t.form.floor}
            </label>
            <input
              id="pf-floor"
              name="floor"
              type="number"
              defaultValue={property?.floor ?? ""}
              className={inputCls}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="pf-floorLabelAr">
              {t.form.floorLabelAr}
            </label>
            <input
              id="pf-floorLabelAr"
              name="floorLabelAr"
              defaultValue={property?.floorLabel?.ar ?? ""}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="pf-floorLabelEn">
              {t.form.floorLabelEn}
            </label>
            <input
              id="pf-floorLabelEn"
              name="floorLabelEn"
              defaultValue={property?.floorLabel?.en ?? ""}
              className={inputCls}
            />
          </div>
        </div>
      </Section>

      <Section title={t.form.contentSection}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="pf-nameAr">
              {t.form.nameAr}
            </label>
            <input
              id="pf-nameAr"
              name="nameAr"
              defaultValue={property?.name.ar ?? ""}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="pf-nameEn">
              {t.form.nameEn}
            </label>
            <input
              id="pf-nameEn"
              name="nameEn"
              defaultValue={property?.name.en ?? ""}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="pf-addressAr">
              {t.form.addressAr}
            </label>
            <input
              id="pf-addressAr"
              name="addressAr"
              defaultValue={property?.address.ar ?? ""}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="pf-addressEn">
              {t.form.addressEn}
            </label>
            <input
              id="pf-addressEn"
              name="addressEn"
              defaultValue={property?.address.en ?? ""}
              className={inputCls}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="pf-descriptionAr">
              {t.form.descriptionAr}
            </label>
            <textarea
              id="pf-descriptionAr"
              name="descriptionAr"
              rows={4}
              defaultValue={property?.description.ar ?? ""}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="pf-descriptionEn">
              {t.form.descriptionEn}
            </label>
            <textarea
              id="pf-descriptionEn"
              name="descriptionEn"
              rows={4}
              defaultValue={property?.description.en ?? ""}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="pf-requirementsAr">
              {t.form.requirementsAr}
            </label>
            <textarea
              id="pf-requirementsAr"
              name="requirementsAr"
              rows={3}
              defaultValue={property?.requirements?.ar ?? ""}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="pf-requirementsEn">
              {t.form.requirementsEn}
            </label>
            <textarea
              id="pf-requirementsEn"
              name="requirementsEn"
              rows={3}
              defaultValue={property?.requirements?.en ?? ""}
              className={inputCls}
            />
          </div>
        </div>
      </Section>

      <Section title={t.form.mediaSection}>
        <ImageInput
          label={t.form.existingImages}
          help={t.form.uploadImages}
          removeLabel={t.form.removeImage}
          emptyLabel={t.form.noImages}
          existing={property?.images ?? []}
        />
        <p className="mt-3 text-xs font-semibold text-slate-400">
          {t.form.imagesHelp}
        </p>
      </Section>

      <Section title={t.form.amenitiesSection}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {(Object.keys(dict.amenities) as AmenityKey[]).map((key) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-2.5 rounded-xl bg-sand-100 px-3.5 py-2.5 text-sm font-bold text-ink-900 ring-1 ring-slate-200 transition hover:ring-brand-400"
            >
              <input
                type="checkbox"
                name="amenities"
                value={key}
                defaultChecked={property?.amenities.includes(key) ?? false}
                className="size-4 accent-brand-600"
              />
              {dict.amenities[key]}
            </label>
          ))}
        </div>
      </Section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="btn-brand inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-extrabold text-white"
        >
          {t.common.save}
        </button>
        <Link
          href={`/${locale}/admin/properties`}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-sm font-extrabold text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          {t.common.cancel}
        </Link>
        {isEdit && property && (
          <span className="text-xs font-bold text-white/40">
            /{property.slug}
          </span>
        )}
      </div>
    </form>
  )
}
