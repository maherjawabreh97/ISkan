import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { Pencil, Plus } from "lucide-react"
import { deleteUserAction } from "@/app/[lang]/admin/actions"
import { ConfirmSubmit } from "@/components/admin/confirm-submit"
import { getCurrentUser } from "@/lib/auth"
import { getAdminDict } from "@/lib/dictionaries/admin"
import { hasLocale, type Locale } from "@/lib/i18n"
import { getPublicUsers } from "@/lib/users-store"

type PageProps = {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ error?: string }>
}

export default async function AdminUsersPage({ params, searchParams }: PageProps) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const t = getAdminDict(locale)

  const current = await getCurrentUser()
  if (!current) redirect(`/${locale}/admin/login`)
  if (current.role !== "admin") redirect(`/${locale}/admin`)

  const { error } = await searchParams
  const users = await getPublicUsers()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">{t.users.title}</h1>
          <p className="mt-1 text-sm font-semibold text-white/50">
            {t.users.subtitle}
          </p>
        </div>
        <Link
          href={`/${locale}/admin/users/new`}
          className="btn-gold inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-black text-ink-950 transition hover:brightness-105"
        >
          <Plus className="size-4" />
          {t.users.add}
        </Link>
      </div>

      {error === "last" && (
        <p className="rounded-2xl bg-red-500/15 px-4 py-3 text-sm font-bold text-red-200 ring-1 ring-red-400/30">
          {t.users.lastAdminError}
        </p>
      )}
      {error === "self" && (
        <p className="rounded-2xl bg-red-500/15 px-4 py-3 text-sm font-bold text-red-200 ring-1 ring-red-400/30">
          {t.users.selfError}
        </p>
      )}

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70">
        {users.length === 0 ? (
          <p className="p-10 text-center text-sm font-semibold text-slate-400">
            {t.users.empty}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-extrabold text-slate-400">
                  <th className="px-5 py-4 text-start">{t.common.name}</th>
                  <th className="px-5 py-4 text-start">
                    {t.common.username}
                  </th>
                  <th className="px-5 py-4 text-start">{t.common.role}</th>
                  <th className="px-5 py-4 text-start">
                    {t.common.createdAt}
                  </th>
                  <th className="px-5 py-4 text-end">{t.common.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="text-sm">
                    <td className="px-5 py-3 font-extrabold text-ink-900">
                      {user.name}
                      {user.id === current.id && (
                        <span className="ms-2 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-extrabold text-brand-700">
                          ★
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-500" dir="ltr">
                      {user.username}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${
                          user.role === "admin"
                            ? "bg-gold-400/20 text-gold-600"
                            : user.role === "editor"
                              ? "bg-brand-50 text-brand-700"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {t.roles[user.role]}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString(
                        locale === "ar" ? "ar" : "en-GB",
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/${locale}/admin/users/${user.id}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-2 text-xs font-extrabold text-ink-900 transition hover:bg-slate-200"
                        >
                          <Pencil className="size-3.5" />
                          {t.common.edit}
                        </Link>
                        {user.id !== current.id && (
                          <form action={deleteUserAction}>
                            <input type="hidden" name="lang" value={locale} />
                            <input type="hidden" name="id" value={user.id} />
                            <ConfirmSubmit
                              message={t.common.confirmDelete}
                              label={t.common.delete}
                              className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3.5 py-2 text-xs font-extrabold text-red-600 transition hover:bg-red-100"
                            />
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
