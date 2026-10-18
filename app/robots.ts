import type { MetadataRoute } from "next"
import { locales } from "@/lib/i18n"

const BASE = "https://iskantr.com"

/**
 * Nothing behind a login may be indexed. The admin dashboard and the private
 * account area are disallowed here *and* carry `noindex` metadata, so they can
 * never surface in a search result.
 */
export default function robots(): MetadataRoute.Robots {
  const privatePaths = ["admin", "account", "login", "register", "report"].flatMap(
    (section) => locales.map((locale) => `/${locale}/${section}`),
  )

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...privatePaths, "/api/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  }
}
