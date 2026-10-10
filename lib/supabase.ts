import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Supabase is optional. When `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
 * are set, the app stores data and images in Supabase. Otherwise it falls back
 * to local JSON files and `public/uploads`.
 *
 * The service-role key bypasses Row Level Security and must stay server-side.
 */
let cached: SupabaseClient | null = null

export function hasSupabase(): boolean {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  )
}

export function getSupabase(): SupabaseClient {
  if (!hasSupabase()) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    )
  }
  if (!cached) {
    cached = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
      {
        auth: { persistSession: false, autoRefreshToken: false },
      },
    )
  }
  return cached
}

export const SUPABASE_BUCKET =
  process.env.SUPABASE_BUCKET || "property-images"
