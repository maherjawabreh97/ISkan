import { notFound, redirect } from "next/navigation"
import { AdminShell } from "@/components/admin/admin-shell"
import { getCurrentUser } from "@/lib/auth"
import { getAdminDict } from "@/lib/dictionaries/admin"
import { hasLocale, type Locale } from "@/lib/i18n"

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang

  const user = await getCurrentUser()
  if (!user) redirect(`/${locale}/admin/login`)

  const t = getAdminDict(locale)

  return (
    <AdminShell
      locale={locale}
      t={t}
      user={{
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      }}
    >
      {children}
    </AdminShell>
  )
}
