"use client"

import Link from "next/link"

export function NavLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="rounded-full px-4 py-2 text-sm font-bold tracking-wide transition hover:bg-white/10 hover:text-white text-white/70"
    >
      {children}
    </Link>
  )
}
