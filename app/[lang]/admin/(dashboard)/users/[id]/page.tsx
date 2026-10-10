import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { UserForm } from "@/components/admin/user-form"
import { getCurrentUser } from "@/lib/auth"
import { getAdminDict } from "@/lib/dictionaries/admin"
import { hasLocale, type Locale } from "@/lib/i18n"
import { getUser, toPublicUser } from "@/lib/users-store"

type PageProps = {
  params: Promise<{ lang: string; id: string }>
}

export default async function EditUserPage({ params }: PageProps) {
  const { lang, id } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const current = await getCurrentUser()
  if (!current) redirect(`/${locale}/admin/login`)
  if (current.role !== "admin") redirect(`/${locale}/admin`)

  const user = await getUser(id)
  if (!user) notFound()
  const t = getAdminDict(locale)

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/${locale}/admin/users`}
          className="inline-flex items-center gap-2 text-sm font-bold text-white/60 transition hover:text-white"
        >
          <ArrowLeft className="size-4 rtl:-scale-x-100" />
          {t.users.title}
        </Link>
        <h1 className="mt-3 text-3xl font-black text-white">
          {t.users.edit}
        </h1>
      </div>
      <UserForm locale={locale} t={t} user={toPublicUser(user)} />
    </div>
  )
}
