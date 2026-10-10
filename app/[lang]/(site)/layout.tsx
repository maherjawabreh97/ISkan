import { notFound } from "next/navigation"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
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
      <main className="flex-1 pt-16">{children}</main>
      <SiteFooter locale={locale} dict={dict} />
      <ScrollTop />
    </>
  )
}
