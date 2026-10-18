import { notFound } from "next/navigation"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import {
  MobileTabBar,
  MobileWhatsAppFab,
} from "@/components/mobile-tab-bar"
import { ScrollTop } from "@/components/scroll-top"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const dict = await getDictionary(locale)

  return (
    <>
      <SiteHeader locale={locale} dict={dict} />
      {/* pb clears the fixed mobile tab bar. */}
      <main className="flex-1 pt-16 pb-20 md:pb-0">{children}</main>
      <SiteFooter locale={locale} dict={dict} />
      <MobileTabBar locale={locale} dict={dict} />
      <MobileWhatsAppFab label={dict.common.whatsapp} />
      <ScrollTop />
    </>
  )
}
