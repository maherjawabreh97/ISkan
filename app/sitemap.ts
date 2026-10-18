import type { MetadataRoute } from "next"
import { getProperties } from "@/lib/properties-store"

const BASE = "https://iskantr.com"

/**
 * Public pages only.
 *
 * The dashboard and every signed-in area are deliberately absent — on top of
 * the `noindex` metadata they carry, a crawler that follows this sitemap has no
 * path at all into them.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let slugs: string[] = []
  try {
    slugs = (await getProperties()).map((property) => property.slug)
  } catch {
    // A sitemap is a nice-to-have; never let it take the page down.
    slugs = []
  }

  const now = new Date()
  const locales = ["ar", "en"] as const

  const staticRoutes = ["", "/properties", "/submit", "/privacy", "/cookies"]
  const entries: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    for (const route of staticRoutes) {
      entries.push({
        url: `${BASE}/${locale}${route}`,
        lastModified: now,
        changeFrequency: route === "" ? "daily" : "weekly",
        priority: route === "" ? 1 : route === "/properties" ? 0.9 : 0.4,
      })
    }
    for (const slug of slugs) {
      entries.push({
        url: `${BASE}/${locale}/properties/${slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      })
    }
  }

  return entries
}