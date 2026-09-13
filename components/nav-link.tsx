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
  const active =
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`))

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative text-sm font-bold tracking-wide transition ${
        active ? "text-gold-300" : "text-white/70 hover:text-white"
      }`}
    >
      {children}
      <span
        className={`absolute -bottom-2 start-0 h-px rounded-full bg-gradient-to-r from-gold-400 to-transparent transition-all duration-300 ${
          active ? "w-full" : "w-0"
        }`}
      />
      {active && (
        <span className="absolute -top-2 start-1/2 size-1 -translate-x-1/2 rounded-full bg-gold-400" />
      )}
    </Link>
  )
}