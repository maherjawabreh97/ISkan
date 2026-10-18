import { notFound } from "next/navigation"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { MobileTabBar } from "@/components/mobile-tab-bar"
import { ScrollTop } from "@/components/scroll-top"
import { getSignedInAccount } from "@/lib/account-auth"
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

  // Drives whether the nav says "sign in" or "my account". The session is an
  // HttpOnly cookie, so this is the only place the state can be read.
  const signedIn = Boolean(await getSignedInAccount())

  return (
    <>
      <SiteHeader locale={locale} dict={dict} signedIn={signedIn} />
      {/* pb clears the fixed mobile tab bar. */}
      <main className="flex-1 pt-16 pb-20 md:pb-0">{children}</main>
      <SiteFooter locale={locale} dict={dict} signedIn={signedIn} />
      <MobileTabBar locale={locale} dict={dict} signedIn={signedIn} />
      <ScrollTop />
    </>
  )
}
