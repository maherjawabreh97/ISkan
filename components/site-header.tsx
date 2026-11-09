"use client"

import { useEffect, useState } from "react"
import { Phone, Home, Building2, Plus, UserCog, LogIn } from "lucide-react"
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
              worth surfacing in the bar itself.

              Brand gold rather than WhatsApp green: the bar has one accent
              colour and a second one next to it just reads as a mistake. */}
          <a
            href={`https://wa.me/${site.phoneHref.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-gold-400 text-ink-950 shadow-sm shadow-black/20 transition hover:bg-gold-300 lg:hidden"
            aria-label={dict.common.whatsapp}
            title={dict.common.whatsapp}
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-5"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </a>

          {/* Icon only: the number used to run the width of the bar and pushed
              the account and language controls out of line. Still a real
              tel: link, just without the digits spelled out. */}
          <a
            href={`tel:${site.phoneHref}`}
            className="hidden size-10 shrink-0 place-items-center rounded-full border border-white/25 bg-white/[0.08] text-gold-300 transition hover:border-gold-400/60 hover:bg-white/[0.14] lg:grid"
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
