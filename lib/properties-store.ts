import { promises as fs } from "node:fs"
import path from "node:path"
import type { Property } from "./properties"
import { properties as seedProperties } from "./properties"
import { getSupabase, hasSupabase } from "./supabase"

const DATA_DIR = path.join(process.cwd(), "data")
const DATA_FILE = path.join(DATA_DIR, "properties.json")

/**
 * Serialize writes so concurrent requests cannot corrupt the JSON file.
 */
let chain: Promise<unknown> = Promise.resolve()
function serialize<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn)
  chain = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

async function readAll(): Promise<Property[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as Property[]
    return [...seedProperties]
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
    await fs.writeFile(DATA_FILE, JSON.stringify(seedProperties, null, 2), "utf8")
    return [...seedProperties]
  }
}

async function writeAll(list: Property[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2), "utf8")
}

export async function getProperties(): Promise<Property[]> {
  if (hasSupabase()) {
    const { data, error } = await getSupabase()
      .from("properties")
      .select("data")
      .order("created_at", { ascending: false })
    if (error) {
      console.error("[properties] supabase select failed:", error.message)
      return []
    }
    return (data ?? []).map((row) => row.data as Property)
  }
  return readAll()
}

export async function getStoredProperty(
  slug: string,
): Promise<Property | undefined> {
  if (hasSupabase()) {
    const { data, error } = await getSupabase()
      .from("properties")
      .select("data")
      .eq("slug", slug)
      .maybeSingle()
    if (error) {
      console.error("[properties] supabase select failed:", error.message)
      return undefined
    }
    return (data?.data as Property | undefined) ?? undefined
  }
  const list = await readAll()
  return list.find((property) => property.slug === slug)
}

export function upsertProperty(property: Property): Promise<Property> {
  if (hasSupabase()) {
    return (async () => {
      const { error } = await getSupabase()
        .from("properties")
        .upsert(
          {
            slug: property.slug,
            data: property,
            purpose: property.purpose,
            featured: property.featured,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "slug" },
        )
      if (error) throw new Error(error.message)
      return property
    })()
  }
  return serialize(async () => {
    const list = await readAll()
    const index = list.findIndex((item) => item.slug === property.slug)
    if (index >= 0) list[index] = property
    else list.unshift(property)
    await writeAll(list)
    return property
  })
}

export function removeProperty(slug: string): Promise<boolean> {
  if (hasSupabase()) {
    return (async () => {
      const existing = await getStoredProperty(slug)
      if (!existing) return false
      const { error } = await getSupabase()
        .from("properties")
        .delete()
        .eq("slug", slug)
      if (error) throw new Error(error.message)
      return true
    })()
  }
  return serialize(async () => {
    const list = await readAll()
    const next = list.filter((item) => item.slug !== slug)
    await writeAll(next)
    return next.length !== list.length
  })
}

export async function slugExists(slug: string): Promise<boolean> {
  if (hasSupabase()) {
    const { data, error } = await getSupabase()
      .from("properties")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle()
    if (error) {
      console.error("[properties] supabase select failed:", error.message)
      return false
    }
    return Boolean(data)
  }
  return (await readAll()).some((item) => item.slug === slug)
}
