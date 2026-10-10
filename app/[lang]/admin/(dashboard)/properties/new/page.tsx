import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { PropertyForm } from "@/components/admin/property-form"
import { getAdminDict } from "@/lib/dictionaries/admin"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"

type PageProps = {
  params: Promise<{ lang: string }>
}

export default async function NewPropertyPage({ params }: PageProps) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const [dict, t] = await Promise.all([
    getDictionary(locale),
    Promise.resolve(getAdminDict(locale)),
  ])

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/${locale}/admin/properties`}
          className="inline-flex items-center gap-2 text-sm font-bold text-white/60 transition hover:text-white"
        >
          <ArrowLeft className="size-4 rtl:-scale-x-100" />
          {t.properties.title}
        </Link>
        <h1 className="mt-3 text-3xl font-black text-white">
          {t.properties.add}
        </h1>
      </div>
      <PropertyForm locale={locale} dict={dict} t={t} />
    </div>
  )
}
