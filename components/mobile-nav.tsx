"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2,
  Flag as FlagIcon,
  Heart,
  Home,
  LogIn,
  Menu,
  MessageCircle,
  Phone,
  Plus,
  UserCog,
  X,
} from "lucide-react"
import type { Dictionary } from "@/lib/dictionaries/types"
import type { Locale } from "@/lib/i18n"
import { site } from "@/lib/site"
import { Logo } from "./logo"

export function MobileNav({
  locale,
  dict,
  signedIn = false,
}: {
  locale: Locale
  dict: Dictionary
  /** Swaps the account entry between "sign in" and "my account". */
  signedIn?: boolean
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close whenever the route changes. Adjusting state during render (rather
  // than in an effect) keeps the drawer from flashing open for one frame after
  // a navigation.
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  const accountEntry = signedIn
    ? { label: dict.account.title, href: `/${locale}/account`, icon: UserCog }
    : {
        label: dict.account.signInTab,
        href: `/${locale}/login`,
        icon: LogIn,
      }

  const links = [
    { label: dict.nav.home, href: `/${locale}`, icon: Home },
    { label: dict.nav.properties, href: `/${locale}/properties`, icon: Building2 },
    { label: dict.common.favorites, href: `/${locale}/properties?favorites=1`, icon: Heart },
    accountEntry,
    { label: dict.report.title, href: `/${locale}/report`, icon: FlagIcon },
  ]

  // Sign-in sits directly under "post your ad" — the two things a visitor is
  // most likely to want right after reading a listing.
  const actions = [
    { label: dict.nav.submit, href: `/${locale}/submit`, icon: Plus, primary: true },
    { label: dict.account.loginButton, href: `/${locale}/login`, icon: LogIn, primary: false },
  ]

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="grid size-10 place-items-center rounded-xl border border-white/12 bg-white/[0.05] text-white transition hover:border-gold-400/40 hover:bg-white/10 active:scale-95"
      >
        <Menu className="size-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-ink-950">
          <div className="pointer-events-none absolute -top-32 start-[-6rem] size-80 rounded-full bg-brand-600/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 end-[-6rem] size-80 rounded-full bg-gold-500/10 blur-3xl" />

          <div className="relative flex items-center justify-between px-5 py-4">
            <Logo locale={locale} name={dict.brand.name} onClick={() => setOpen(false)} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="grid size-10 place-items-center rounded-xl border border-white/12 text-white transition hover:bg-white/10 active:scale-95"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-2 pb-[calc(2.5rem+env(safe-area-inset-bottom))]">
            <nav className="flex flex-col gap-1.5">
              {links.map(({ label, href, icon: Icon }) => {
                const [path] = href.split("?")
                const active = pathname === path
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-4 rounded-2xl px-4 py-3.5 text-[15px] font-extrabold transition ${
                      active
                        ? "bg-gold-400/12 text-gold-300 ring-1 ring-gold-400/25"
                        : "text-white/85 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                        active ? "bg-gold-400/15" : "bg-white/[0.06]"
                      }`}
                    >
                      <Icon className="size-5" />
                    </span>
                    {label}
                  </Link>
                )
              })}
            </nav>

            <div className="mt-6 border-t border-white/[0.08] pt-6">
              <p className="mb-3 px-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/40">
                {dict.footer.quickLinks}
              </p>
              <div className="grid gap-2.5">
                {actions.map(({ label, href, icon: Icon, primary }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-extrabold transition active:scale-[0.98] ${
                      primary
                        ? "bg-gold-400 text-ink-950"
                        : "border border-white/12 bg-white/[0.05] text-white/85"
                    }`}
                  >
                    <Icon className="size-4.5" />
                    {label}
                  </Link>
                ))}
                <a
                  href={`https://wa.me/${site.phoneHref.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-3.5 text-sm font-extrabold text-white transition active:scale-[0.98]"
                >
                  <MessageCircle className="size-4.5" />
                  {dict.common.whatsapp}
                </a>
                <a
                  href={`tel:${site.phoneHref}`}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-white/12 px-5 py-3.5 text-sm font-extrabold text-white/85 transition active:scale-[0.98]"
                >
                  <Phone className="size-4.5" />
                  <span dir="ltr">{site.phone}</span>
                </a>
              </div>
            </div>

            <p className="mt-6 text-center text-xs font-semibold leading-relaxed text-white/35">
              {dict.brand.tagline}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
