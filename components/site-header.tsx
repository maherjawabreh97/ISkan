"use client"

import { useEffect, useState } from "react"
import { MessageCircle, Phone, Home, Building2, Plus, UserCog, LogIn } from "lucide-react"
import Link from "next/link"
import type { Dictionary } from "@/lib/dictionaries/types"
import type { Locale } from "@/lib/i18n"
import { site } from "@/lib/site"
import { LanguageSwitcher } from "./language-switcher"
import { Logo } from "./logo"
import { MobileNav } from "./mobile-nav"
import { NavLink } from "./nav-link"

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

        <div className="flex items-center gap-2">
          {/* Mobile gets WhatsApp, desktop gets the dial button. On a phone the
              drawer is two taps away, and WhatsApp is how most people in
              Turkey actually reach an agency — so it is the one contact action
              worth surfacing in the bar itself. */}
          <a
            href={`https://wa.me/${site.phoneHref.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-[#25D366] text-white transition hover:bg-[#1eb85a] lg:hidden"
            aria-label={dict.common.whatsapp}
            title={dict.common.whatsapp}
          >
            <MessageCircle className="size-4.5" />
          </a>

          {/* Icon only: the number used to run the width of the bar and pushed
              the account and language controls out of line. Still a real
              tel: link, just without the digits spelled out. */}
          <a
            href={`tel:${site.phoneHref}`}
            className="hidden size-10 shrink-0 place-items-center rounded-full border border-white/12 bg-white/[0.05] text-gold-300 transition hover:border-gold-400/40 hover:bg-white/10 lg:grid"
            aria-label={site.phone}
            title={site.phone}
          >
            <Phone className="size-4" />
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
          <LanguageSwitcher locale={locale} />
          <MobileNav locale={locale} dict={dict} signedIn={signedIn} />
        </div>
      </div>
    </header>
  )
}
