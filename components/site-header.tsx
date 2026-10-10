"use client"

import { useEffect, useState } from "react"
import { Phone, Home, Building2, Mail, Plus } from "lucide-react"
import Link from "next/link"
import type { Dictionary } from "@/lib/dictionaries/types"
import type { Locale } from "@/lib/i18n"
import { site } from "@/lib/site"
import { LanguageSwitcher } from "./language-switcher"
import { Logo } from "./logo"
import { MobileNav } from "./mobile-nav"
import { NavLink } from "./nav-link"
import { FavoritesChip } from "./favorites-chip"

export function SiteHeader({
  locale,
  dict,
}: {
  locale: Locale
  dict: Dictionary
}) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const navItems = [
    { icon: Home, label: dict.nav.home, href: `/${locale}` },
    { icon: Building2, label: dict.nav.properties, href: `/${locale}/properties` },
  ]

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-ink-950/[0.97] backdrop-blur-xl transition-shadow duration-500 ${
        scrolled ? "shadow-[0_20px_50px_-20px_rgba(0,0,0,0.65)]" : ""
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" />

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Logo locale={locale} name={dict.brand.name} />

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map(({ icon: Icon, label, href }) => (
            <NavLink key={href} href={href}>
              <span className="inline-flex items-center gap-2">
                <Icon className="size-4" />
                {label}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <a
            href={`tel:${site.phoneHref}`}
            className="hidden items-center gap-2 rounded-full bg-gold-400/15 px-3 py-2 text-sm font-bold text-gold-300 ring-1 ring-gold-400/25 transition hover:bg-gold-400 hover:text-ink-950 hover:ring-gold-400 lg:inline-flex"
          >
            <Phone className="size-3.5" />
            <span dir="ltr">{site.phone}</span>
          </a>
          <FavoritesChip locale={locale} />
          <LanguageSwitcher locale={locale} />
          <MobileNav locale={locale} dict={dict} />
        </div>
      </div>
    </header>
  )
}
