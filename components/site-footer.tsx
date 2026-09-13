import Link from "next/link"
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react"
import type { Dictionary, PropertyTypeKey } from "@/lib/dictionaries/types"
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
    { label: dict.footer.privacy, href: `/${locale}/privacy` },
    { label: dict.footer.cookies, href: `/${locale}/cookies` },
  ]

  const exploreLinks = (Object.keys(dict.propertyTypes) as PropertyTypeKey[]).map(
    (key) => ({
      label: dict.propertyTypes[key],
      href: `/${locale}/properties?type=${key}`,
    }),
  )

  const years = new Date().getFullYear()

  const colTitle =
    "flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-white"
  const linkCls =
    "group inline-flex items-center gap-2.5 text-sm transition hover:text-gold-300"

  const iconWrap = (accent: string) =>
    `grid size-9 shrink-0 place-items-center rounded-xl bg-white/[0.06] ring-1 ring-white/10 ${accent}`

  return (
    <footer className="relative overflow-hidden bg-ink-950 text-white/70">
      {/* soft glows */}
      <div className="bg-grid-dark absolute inset-0 opacity-30" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
      <div className="absolute -end-40 -top-40 size-[30rem] rounded-full bg-brand-600/15 blur-3xl" />
      <div className="absolute -start-40 bottom-0 size-[30rem] rounded-full bg-gold-500/10 blur-3xl" />

      {/* ================= Contact strip ================= */}
      <div className="relative mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-r from-brand-900/60 via-ink-950 to-ink-950 px-6 py-8 backdrop-blur sm:px-10">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" />
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
            <div className="text-center lg:text-start">
              <p className="text-lg font-black text-white sm:text-xl">
                {dict.sections.ctaTitle}
              </p>
              <p className="mt-1 text-sm text-white/60">
                {dict.sections.ctaSubtitle}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={`tel:${site.phoneHref}`}
                className="btn-gold inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-extrabold"
              >
                <Phone className="size-4" />
                <span dir="ltr">{site.phone}</span>
              </a>
              <a
                href={`https://wa.me/905432466309`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-6 py-3 text-sm font-extrabold text-[#6ee7a8] transition hover:bg-[#25D366] hover:text-white"
              >
                <MessageCircle className="size-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ================= Columns ================= */}
      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.25fr]">
          {/* Brand */}
          <div className="md:max-w-sm">
            <Logo locale={locale} name={dict.brand.name} compact />
            <p className="mt-4 text-sm font-extrabold tracking-wide text-gold-300">
              {dict.brand.officeName}
            </p>
            <p className="mt-2 text-sm font-semibold text-white/80">
              {dict.brand.tagline}
            </p>
            <p className="mt-4 text-sm leading-relaxed">{dict.footer.about}</p>
            <div className="mt-6 flex gap-2.5">
              {socials.map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-white/70 transition hover:border-gold-400/50 hover:bg-gold-400 hover:text-ink-950"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className={colTitle}>
              <span className="h-3.5 w-px bg-gold-400" />
              {dict.footer.quickLinks}
            </h3>
            <ul className="mt-6 space-y-3.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkCls}>
                    <span className="size-1 rounded-full bg-gold-400/60 transition group-hover:bg-gold-400" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h3 className={colTitle}>
              <span className="h-3.5 w-px bg-gold-400" />
              {dict.footer.exploreTitle}
            </h3>
            <ul className="mt-6 space-y-3.5">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkCls}>
                    <span className="size-1 rounded-full bg-gold-400/60 transition group-hover:bg-gold-400" />
                    {link.label}
                    <ArrowUpRight className="size-3.5 opacity-0 transition group-hover:opacity-100 rtl:-scale-x-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className={colTitle}>
              <span className="h-3.5 w-px bg-gold-400" />
              {dict.footer.contactTitle}
            </h3>
            <ul className="mt-6 space-y-4 text-sm">
              <li>
                <a
                  href={`tel:${site.phoneHref}`}
                  className="flex items-center gap-3 transition hover:text-gold-300"
                >
                  <span className={iconWrap("text-gold-300")}>
                    <Phone className="size-4" />
                  </span>
                  <span dir="ltr" className="font-bold text-white/85">
                    {site.phone}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="flex items-center gap-3 transition hover:text-gold-300"
                >
                  <span className={iconWrap("text-gold-300")}>
                    <Mail className="size-4" />
                  </span>
                  <span>{site.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/905432466309`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 transition hover:text-gold-300"
                >
                  <span className={iconWrap("text-[#25D366]")}>
                    <MessageCircle className="size-4" />
                  </span>
                  <span>WhatsApp</span>
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className={iconWrap("text-gold-300")}>
                  <MapPin className="size-4" />
                </span>
                <span>{site.address[locale]}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ================= Bottom bar ================= */}
        <div className="mt-14 flex flex-col items-center justify-between gap-5 border-t border-white/10 pt-6 md:flex-row">
          <p className="text-xs text-white/45">
            © {years} {dict.brand.officeName}. {dict.footer.rights}.
          </p>

          <div className="flex items-center gap-2 text-xs font-bold">
            <Link
              href={`/${locale}`}
              aria-label="Back to home"
              className="grid size-8 place-items-center rounded-full border border-white/10 text-white/70 transition hover:border-gold-400/40 hover:bg-gold-400 hover:text-ink-950"
            >
              <ChevronLeft className="size-4 rtl:hidden" />
              <ChevronRight className="size-4 ltr:hidden" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}