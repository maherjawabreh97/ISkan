"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building2, LayoutDashboard, Users } from "lucide-react"
import type { AdminDict } from "@/lib/dictionaries/admin"
import type { Locale } from "@/lib/i18n"

export function AdminNav({
  locale,
  t,
  isAdmin,
}: {
  locale: Locale
  t: AdminDict
  isAdmin: boolean
}) {
  const pathname = usePathname()

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
    ...(isAdmin
      ? [
          {
            href: `/${locale}/admin/users`,
            label: t.nav.users,
            icon: Users,
            exact: false,
          },
        ]
      : []),
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
