"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2,
  Heart,
  Home,
  LogIn,
  MessageCircle,
  Plus,
  UserCog,
} from "lucide-react"
import type { Dictionary } from "@/lib/dictionaries/types"
import type { Locale } from "@/lib/i18n"
import { site } from "@/lib/site"

/**
 * Mobile bottom tab bar — the pattern people expect from a marketplace app.
 *
 * It deliberately steps aside on a property detail page, where the sticky
 * call / WhatsApp / save bar already owns the bottom of the screen.
 */
export function MobileTabBar({
  locale,
  dict,
  signedIn = false,
}: {
  locale: Locale
  dict: Dictionary
  /** Swaps the last tab between "sign in" and "my account". */
  signedIn?: boolean
}) {
  const pathname = usePathname()

  // Detail pages have their own sticky action bar; two bars would collide.
  const isDetail = /^\/(ar|en)\/properties\/[^/]+\/?$/.test(pathname)
  if (isDetail) return null

  const accountHref = signedIn ? `/${locale}/account` : `/${locale}/login`
  const accountLabel = signedIn ? dict.account.title : dict.account.signInTab
  const isAccount = pathname.startsWith(`/${locale}/account`)
  const isLogin = pathname.startsWith(`/${locale}/login`)

  const tabs = [
    {
      label: dict.nav.home,
      href: `/${locale}`,
      icon: Home,
      active: pathname === `/${locale}`,
    },
    {
      label: dict.nav.properties,
      href: `/${locale}/properties`,
      icon: Building2,
      active: pathname.startsWith(`/${locale}/properties`),
    },
  ]

  const isFavorites = pathname.includes("favorites=1")
  const isSubmit = pathname.startsWith(`/${locale}/submit`)

  return (
    <nav
      aria-label={dict.nav.properties}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-ink-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      {/* Anchored to the bar itself rather than to a guessed offset, so it can
          never end up underneath it however tall the bar grows. */}
      {!isDetail && (
        <a
          href={`https://wa.me/${site.phoneHref.replace(/[^0-9]/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={dict.common.whatsapp}
          className="absolute -top-14 end-4 z-10 grid size-12 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_-8px_rgba(37,211,102,0.7)] ring-1 ring-white/25 transition active:scale-95"
        >
          <MessageCircle className="size-6" />
        </a>
      )}

      <div className="mx-auto grid max-w-lg grid-cols-5 items-end gap-0.5 px-1.5 pt-2">
        {tabs.map(({ label, href, icon: Icon, active }) => (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-bold transition ${
              active ? "text-gold-300" : "text-white/55"
            }`}
          >
            <span
              className={`grid size-9 place-items-center rounded-xl transition ${
                active ? "bg-gold-400/15 ring-1 ring-gold-400/30" : ""
              }`}
            >
              <Icon className="size-5" />
            </span>
            <span className="leading-none">{label}</span>
          </Link>
        ))}

        {/* Primary action — raised like a floating action button. */}
        <Link
          href={`/${locale}/submit`}
          aria-current={isSubmit ? "page" : undefined}
          className="flex flex-col items-center gap-1 px-1 py-1.5 text-[10px] font-bold text-gold-300"
        >
          <span className="-mt-5 grid size-12 place-items-center rounded-2xl bg-gold-400 text-ink-950 shadow-lg shadow-gold-500/30 ring-4 ring-ink-950 transition active:scale-95">
            <Plus className="size-6" />
          </span>
          <span className="leading-none">{dict.nav.submit}</span>
        </Link>

        <Link
          href={`/${locale}/properties?favorites=1`}
          aria-current={isFavorites ? "page" : undefined}
          className={`flex flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-bold transition ${
            isFavorites ? "text-gold-300" : "text-white/55"
          }`}
        >
          <span
            className={`grid size-9 place-items-center rounded-xl transition ${
              isFavorites ? "bg-gold-400/15 ring-1 ring-gold-400/30" : ""
            }`}
          >
            <Heart className="size-5" />
          </span>
          <span className="leading-none">{dict.common.favorites}</span>
        </Link>

        <Link
          href={accountHref}
          aria-current={isAccount || isLogin ? "page" : undefined}
          className={`flex flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-bold transition ${
            isAccount || isLogin ? "text-gold-300" : "text-white/55"
          }`}
        >
          <span
            className={`grid size-9 place-items-center rounded-xl transition ${
              isAccount || isLogin ? "bg-gold-400/15 ring-1 ring-gold-400/30" : ""
            }`}
          >
            {signedIn ? <UserCog className="size-5" /> : <LogIn className="size-5" />}
          </span>
          <span className="leading-none">{accountLabel}</span>
        </Link>
      </div>
    </nav>
  )
}
