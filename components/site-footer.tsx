import Link from "next/link"
import { Mail, MapPin, Phone } from "lucide-react"
import type { Dictionary } from "@/lib/dictionaries/types"
import type { Locale } from "@/lib/i18n"
import { site } from "@/lib/site"
import { Logo } from "./logo"
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  XIcon,
} from "./social-icons"

const socials = [
  { icon: FacebookIcon, label: "Facebook" },
  { icon: InstagramIcon, label: "Instagram" },
  { icon: XIcon, label: "X" },
  { icon: LinkedinIcon, label: "LinkedIn" },
]

export function SiteFooter({
  locale,
  dict,
}: {
  locale: Locale
  dict: Dictionary
}) {
  const quickLinks = [
    { label: dict.nav.home, href: `/${locale}` },
    { label: dict.nav.properties, href: `/${locale}/properties` },
    {
      label: dict.nav.contact,
      href: `mailto:${site.email}`,
    },
  ]

  return (
    <footer className="bg-ink-950 text-white/70">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <Logo locale={locale} name={dict.brand.name} />
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              {dict.footer.about}
            </p>
            <div className="mt-5 flex gap-2.5">
              {socials.map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="grid size-9 place-items-center rounded-full bg-white/5 ring-1 ring-white/10 transition hover:bg-brand-600 hover:text-white"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
              {dict.footer.quickLinks}
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-gold-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
              {dict.footer.contactTitle}
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href={`tel:${site.phoneHref}`}
                  className="flex items-center gap-3 transition hover:text-gold-300"
                >
                  <Phone className="size-4 shrink-0 text-brand-400" />
                  <span dir="ltr">{site.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="flex items-center gap-3 transition hover:text-gold-300"
                >
                  <Mail className="size-4 shrink-0 text-brand-400" />
                  <span>{site.email}</span>
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="size-4 shrink-0 text-brand-400" />
                <span>{site.address[locale]}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {dict.footer.madeWith}.{" "}
            {dict.footer.rights}.
          </p>
          <p>{dict.brand.tagline}</p>
        </div>
      </div>
    </footer>
  )
}