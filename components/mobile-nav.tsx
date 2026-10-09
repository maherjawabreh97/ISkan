"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import type { Dictionary } from "@/lib/dictionaries/types"
import type { Locale } from "@/lib/i18n"
import { Logo } from "./logo"

export function MobileNav({
  locale,
  dict,
}: {
  locale: Locale
  dict: Dictionary
}) {
  const [open, setOpen] = useState(false)
  const links = [
    { label: dict.nav.home, href: `/${locale}` },
    { label: dict.nav.properties, href: `/${locale}/properties` },
  ]
  const purposeLinks = [
    { label: dict.common.forSale, href: `/${locale}/properties?purpose=sale` },
    { label: dict.common.forRent, href: `/${locale}/properties?purpose=rent` },
  ]

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="grid size-10 place-items-center rounded-full border border-white/12 bg-white/[0.05] text-white transition hover:border-gold-400/40 hover:bg-white/10"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-ink-950 px-6 py-5">
          <div className="flex items-center justify-between">
            <Logo locale={locale} name={dict.brand.name} onClick={() => setOpen(false)} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid size-10 place-items-center rounded-full border border-white/15 text-white transition hover:bg-white/10"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
          </div>
          <nav className="mt-12 flex flex-col gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-4 text-2xl font-extrabold text-white transition hover:bg-white/5 hover:text-gold-300"
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-4 grid grid-cols-2 gap-3">
              {purposeLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-2xl border px-4 py-5 text-center text-lg font-extrabold transition ${
                    index === 0
                      ? "border-gold-400/40 bg-gold-400/15 text-gold-200 hover:bg-gold-400 hover:text-ink-950"
                      : "border-brand-400/40 bg-brand-400/15 text-brand-100 hover:bg-brand-500 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
          <p className="mt-auto text-sm text-white/50">{dict.brand.tagline}</p>
        </div>
      )}
    </div>
  )
}