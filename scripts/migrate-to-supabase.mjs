// One-time migration: copy local JSON data into Supabase.
//
// Usage:
//   npm run migrate:supabase
//
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env (or the
// environment). Reads data/properties.json and data/users.json and upserts them
// into the tables created by supabase/schema.sql. Safe to run more than once.
//
// Note: images that live in public/uploads keep working via their relative
// URLs, so they do not need to be moved (only newly uploaded images use the
// Supabase bucket).

import { createClient } from "@supabase/supabase-js"
import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import path from "node:path"

async function loadEnv() {
  const file = path.join(process.cwd(), ".env")
  if (!existsSync(file)) return
  const text = await readFile(file, "utf8")
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([\w.]+)\s*=\s*(.*)$/)
    if (!match) continue
    const [, key, rawValue] = match
    let value = rawValue.trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = value
  }
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, "utf8"))
  } catch {
    return null
  }
}

async function main() {
  await loadEnv()

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error(
      "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Add them to .env first.",
    )
    process.exit(1)
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const properties = await readJson(
    path.join(process.cwd(), "data", "properties.json"),
  )
  if (!properties) {
    console.log("No data/properties.json found — skipping listings.")
  } else {
    const rows = properties.map((property) => ({
      slug: property.slug,
      data: property,
      purpose: property.purpose ?? "sale",
      featured: Boolean(property.featured),
      updated_at: new Date().toISOString(),
    }))
    const { error } = await supabase
      .from("properties")
      .upsert(rows, { onConflict: "slug" })
    if (error) throw error
    console.log(`Migrated ${rows.length} listings.`)
  }

  const users = await readJson(path.join(process.cwd(), "data", "users.json"))
  if (!users) {
    console.log("No data/users.json found — skipping users.")
  } else {
    let inserted = 0
    for (const user of users) {
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .ilike("username", user.username)
        .maybeSingle()
      if (existing) continue
      const { error } = await supabase.from("users").insert({
        username: user.username,
        name: user.name || user.username,
        role: user.role || "viewer",
        password_hash: user.passwordHash,
      })
      if (error) throw error
      inserted += 1
    }
    console.log(
      `Migrated ${inserted} users (${users.length - inserted} already existed).`,
    )
  }

  console.log("Done.")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
