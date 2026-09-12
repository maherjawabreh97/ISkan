import Link from "next/link"
import { Phone } from "lucide-react"
import type { Dictionary } from "@/lib/dictionaries/types"
import type { Locale } from "@/lib/i18n"
import { site } from "@/lib/site"
import { LanguageSwitcher } from "./language-switcher"
import { Logo } from "./logo"
import { MobileNav } from "./mobile-nav"

export function SiteHeader({
  locale,
  dict,
}: {
  locale: Locale
  dict: Dictionary
}) {
  const links = [
    { label: dict.nav.home, href: `/${locale}` },
    { label: dict.nav.properties, href: `/${locale}/properties` },
  ]

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-ink-950/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo locale={locale} name={dict.brand.name} />

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-bold text-white/75 transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <a
            href={`tel:${site.phoneHref}`}
            className="hidden items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-brand-950/30 transition hover:bg-brand-500 lg:inline-flex"
          >
            <Phone className="size-4" />
            <span dir="ltr">{site.phone}</span>
          </a>
          <LanguageSwitcher locale={locale} />
          <MobileNav locale={locale} dict={dict} />
        </div>
      </div>
    </header>
  )
}