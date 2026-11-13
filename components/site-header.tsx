"use client"

import { useEffect, useState } from "react"
import { Home, Building2, Plus, UserCog, LogIn } from "lucide-react"
import Link from "next/link"
import type { Dictionary } from "@/lib/dictionaries/types"
import type { Locale } from "@/lib/i18n"
import { site } from "@/lib/site"
import { LanguageSwitcher } from "./language-switcher"
import { CurrencySwitcher } from "./currency-switcher"
import { AreaUnitSwitcher } from "./area-unit-switcher"
import { Logo } from "./logo"
import { MobileNav } from "./mobile-nav"
import { NavLink } from "./nav-link"
import { WhatsAppIcon } from "./whatsapp-icon"

export function SiteHeader({
  locale,
  dict,
  signedIn = false,
}: {
  locale: Locale
  dict: Dictionary
  signedIn?: boolean
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

      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
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

        <div className="flex items-center gap-2">
          {/* One WhatsApp button for every breakpoint. Solid gold on phones,
              where it is the only contact action in the bar; a quieter outline
              on desktop, where the gold "add listing" button already owns the
              accent colour. */}
          <a
            href={`https://wa.me/${site.phoneHref.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-gold-400 text-ink-950 shadow-sm shadow-black/20 transition hover:bg-gold-300 lg:border lg:border-white/25 lg:bg-white/[0.08] lg:text-gold-300 lg:shadow-none lg:hover:border-gold-400/60 lg:hover:bg-white/[0.14]"
            aria-label={dict.common.whatsapp}
            title={dict.common.whatsapp}
          >
            <WhatsAppIcon className="size-5 lg:size-4.5" />
          </a>
          <Link
            href={`/${locale}/submit`}
            className="hidden items-center gap-1.5 rounded-full bg-gold-400 px-3.5 py-2 text-sm font-black text-ink-950 transition hover:brightness-105 md:inline-flex"
          >
            <Plus className="size-3.5" />
            {dict.nav.submit}
          </Link>
          <Link
            href={signedIn ? `/${locale}/account` : `/${locale}/login`}
            className="hidden items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-2 text-sm font-black text-white transition hover:border-gold-400/50 hover:bg-white/10 lg:inline-flex"
          >
            {signedIn ? <UserCog className="size-3.5" /> : <LogIn className="size-3.5" />}
            {signedIn ? dict.account.title : dict.account.signInTab}
          </Link>
          <AreaUnitSwitcher locale={locale} />
          <CurrencySwitcher locale={locale} />
          <LanguageSwitcher locale={locale} />
          <MobileNav locale={locale} dict={dict} signedIn={signedIn} />
        </div>
      </div>
    </header>
  )
}
