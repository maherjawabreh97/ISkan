import Link from "next/link"
import { ArrowUpRight, LogOut } from "lucide-react"
import { AdminNav } from "@/components/admin/admin-nav"
import { LanguageSwitcher } from "@/components/language-switcher"
import type { AdminDict } from "@/lib/dictionaries/admin"
import type { Locale } from "@/lib/i18n"
import { logoutAction } from "@/app/[lang]/admin/actions"

export function AdminShell({
  locale,
  t,
  user,
  children,
}: {
  locale: Locale
  t: AdminDict
  user: {
    id: string
    username: string
    name: string
    role: "admin" | "editor" | "viewer"
  }
  children: React.ReactNode
}) {
  return (
    <div className="min-h-dvh bg-ink-950">
      <header className="relative border-b border-white/[0.08] bg-ink-950/95 backdrop-blur">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" />
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-800 text-sm font-black text-white ring-1 ring-white/20">
              IS
            </span>
            <div className="leading-tight">
              <p className="text-sm font-black text-white">{t.brand}</p>
              <p className="text-[11px] font-bold text-gold-300">
                {t.common.signedInAs}: {user.name} ({t.roles[user.role]})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-2 text-xs font-extrabold text-white/80 transition hover:border-gold-400/50 hover:text-white"
            >
              {t.nav.viewSite}
              <ArrowUpRight className="size-3.5 rtl:-scale-x-100" />
            </Link>
            <LanguageSwitcher locale={locale} />
            <form action={logoutAction}>
              <input type="hidden" name="lang" value={locale} />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3.5 py-2 text-xs font-extrabold text-white/80 ring-1 ring-white/10 transition hover:bg-red-500/20 hover:text-red-200"
              >
                <LogOut className="size-3.5" />
                {t.nav.signOut}
              </button>
            </form>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-3 sm:px-6 lg:px-8">
          <AdminNav locale={locale} t={t} role={user.role} />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
