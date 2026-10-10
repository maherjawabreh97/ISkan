import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Pencil, Plus } from "lucide-react"
import { deletePropertyAction } from "@/app/[lang]/admin/actions"
import { ConfirmSubmit } from "@/components/admin/confirm-submit"
import { getAdminDict } from "@/lib/dictionaries/admin"
import { formatPrice } from "@/lib/format"
import { hasLocale, type Locale } from "@/lib/i18n"
import { getProperties } from "@/lib/properties-store"

type PageProps = {
  params: Promise<{ lang: string }>
}

export default async function AdminPropertiesPage({ params }: PageProps) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const t = getAdminDict(locale)
  const properties = await getProperties()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">{t.properties.title}</h1>
          <p className="mt-1 text-sm font-semibold text-white/50">
            {t.properties.subtitle}
          </p>
        </div>
        <Link
          href={`/${locale}/admin/properties/new`}
          className="btn-gold inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-black text-ink-950 transition hover:brightness-105"
        >
          <Plus className="size-4" />
          {t.properties.add}
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200/70">
          <h2 className="text-lg font-black text-ink-900">
            {t.properties.empty}
          </h2>
          <p className="mt-1.5 text-sm font-semibold text-slate-400">
            {t.properties.emptyDesc}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-start">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-extrabold text-slate-400">
                  <th className="px-5 py-4 text-start">
                    {t.properties.property}
                  </th>
                  <th className="px-5 py-4 text-start">
                    {t.properties.purpose}
                  </th>
                  <th className="px-5 py-4 text-start">{t.properties.city}</th>
                  <th className="px-5 py-4 text-start">
                    {t.properties.price}
                  </th>
                  <th className="px-5 py-4 text-start">
                    {t.properties.citizenship}
                  </th>
                  <th className="px-5 py-4 text-end">
                    {t.common.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {properties.map((property) => (
                  <tr key={property.slug} className="text-sm">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
                          {property.images[0] && (
                            <Image
                              src={property.images[0]}
                              alt={property.name[locale]}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-[240px] truncate font-extrabold text-ink-900">
                            {property.name[locale]}
                          </p>
                          <p className="text-xs font-semibold text-slate-400">
                            {property.type}
                            {property.featured ? " · ★" : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${
                          property.purpose === "rent"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gold-400/20 text-gold-600"
                        }`}
                      >
                        {property.purpose === "rent"
                          ? t.dashboard.forRent
                          : t.dashboard.forSale}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-600">
                      {property.address[locale]}
                    </td>
                    <td className="px-5 py-3 font-black text-brand-700">
                      {formatPrice(property.price, property.currency ?? "TRY")}
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-600">
                      {property.citizenshipEligible
                        ? t.properties.yes
                        : t.properties.no}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/${locale}/admin/properties/${property.slug}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-2 text-xs font-extrabold text-ink-900 transition hover:bg-slate-200"
                        >
                          <Pencil className="size-3.5" />
                          {t.common.edit}
                        </Link>
                        <form action={deletePropertyAction}>
                          <input type="hidden" name="lang" value={locale} />
                          <input
                            type="hidden"
                            name="slug"
                            value={property.slug}
                          />
                          <ConfirmSubmit
                            message={t.common.confirmDelete}
                            label={t.common.delete}
                            className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3.5 py-2 text-xs font-extrabold text-red-600 transition hover:bg-red-100"
                          />
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
