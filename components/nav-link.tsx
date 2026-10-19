"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function NavLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Exact match, not a prefix: `/ar` is the home link and must not light up
  // while the visitor is anywhere else under `/ar/...`.
  const active = pathname === href

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative rounded-full px-4 py-2 text-sm font-bold transition ${
        active
          ? "bg-white/[0.12] text-white"
          : "text-white/60 hover:bg-white/[0.07] hover:text-white"
      }`}
    >
      {children}
    </Link>
  )
}