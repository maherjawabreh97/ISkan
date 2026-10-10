import Link from "next/link"
import { saveUserAction } from "@/app/[lang]/admin/actions"
import type { AdminDict } from "@/lib/dictionaries/admin"
import type { Locale } from "@/lib/i18n"
import { roles, type PublicUser, type Role } from "@/lib/users-store"

const inputCls =
  "w-full rounded-xl border-0 bg-sand-100 px-3.5 py-2.5 text-sm font-semibold text-ink-900 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-brand-600"
const labelCls = "mb-1.5 block text-xs font-extrabold text-slate-500"

export function UserForm({
  locale,
  t,
  user,
}: {
  locale: Locale
  t: AdminDict
  user?: PublicUser
}) {
  const isEdit = Boolean(user)

  return (
    <form action={saveUserAction} className="space-y-6">
      <input type="hidden" name="lang" value={locale} />
      {user && <input type="hidden" name="id" value={user.id} />}

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="uf-username">
              {t.common.username}
            </label>
            <input
              id="uf-username"
              name="username"
              required
              autoComplete="off"
              defaultValue={user?.username ?? ""}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="uf-name">
              {t.common.name}
            </label>
            <input
              id="uf-name"
              name="name"
              defaultValue={user?.name ?? ""}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="uf-role">
              {t.common.role}
            </label>
            <select
              id="uf-role"
              name="role"
              defaultValue={user?.role ?? "editor"}
              className={inputCls}
            >
              {roles.map((role: Role) => (
                <option key={role} value={role}>
                  {t.roles[role]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="uf-password">
              {isEdit ? t.common.newPassword : t.common.password}
            </label>
            <input
              id="uf-password"
              name="password"
              type="password"
              autoComplete="new-password"
              className={inputCls}
              placeholder={isEdit ? t.common.leaveBlank : t.users.passwordHint}
            />
            <p className="mt-1.5 text-xs font-semibold text-slate-400">
              {isEdit ? t.common.leaveBlank : t.users.passwordHint}
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="btn-brand inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-extrabold text-white"
        >
          {t.common.save}
        </button>
        <Link
          href={`/${locale}/admin/users`}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-sm font-extrabold text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          {t.common.cancel}
        </Link>
      </div>
    </form>
  )
}
