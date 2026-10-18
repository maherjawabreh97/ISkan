"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2,
  Contact,
  Inbox,
  KeyRound,
  LayoutDashboard,
  MessageSquareQuote,
  ShieldCheck,
  Users,
} from "lucide-react"
import type { AdminDict } from "@/lib/dictionaries/admin"
import type { Locale } from "@/lib/i18n"
import type { Role } from "@/lib/users-store"

export function AdminNav({
  locale,
  t,
  role,
}: {
  locale: Locale
  t: AdminDict
  role: Role
}) {
  const pathname = usePathname()
  const isAdmin = role === "admin"

  const items = [
    {
      href: `/${locale}/admin`,
      label: t.nav.dashboard,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: `/${locale}/admin/properties`,
      label: t.nav.properties,
      icon: Building2,
      exact: false,
    },
    ...(role !== "viewer"
      ? [
          {
            href: `/${locale}/admin/submissions`,
            label: t.nav.submissions,
            icon: Inbox,
            exact: false,
          },
          {
            href: `/${locale}/admin/testimonials`,
            label: t.nav.testimonials,
            icon: MessageSquareQuote,
            exact: false,
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            href: `/${locale}/admin/users`,
            label: t.nav.users,
            icon: Users,
            exact: false,
          },
          {
            href: `/${locale}/admin/accounts`,
            label: t.nav.accounts,
            icon: Contact,
            exact: false,
          },
          {
            href: `/${locale}/admin/security`,
            label: t.nav.security,
            icon: ShieldCheck,
            exact: false,
          },
        ]
      : []),
    {
      // Everyone gets this: rotating your own password must not depend on being
      // the owner account.
      href: `/${locale}/admin/settings`,
      label: t.nav.settings,
      icon: KeyRound,
      exact: false,
    },
  ]

  return (
    <nav className="scrollbar-none flex items-center gap-1.5 overflow-x-auto">
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold transition ${
              active
                ? "bg-gold-400 text-ink-950"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
