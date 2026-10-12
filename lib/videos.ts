import crypto from "node:crypto"
import { getSupabase, hasSupabase, SUPABASE_BUCKET } from "./supabase"

/**
 * Short property clips. Videos are uploaded straight from the browser to
 * Supabase Storage with a short-lived signed URL, so the request never passes
 * through the Cloudflare Worker (which has tight body-size and memory limits).
 *
 * The signed URL only authorises one object at one path, and the content type
 * is fixed server-side, so a leaked URL cannot be reused for anything else.
 */

/** 50 MB — matches the default Supabase Storage project limit. */
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024

export const VIDEO_EXTENSION_BY_TYPE: Record<string, string> = {
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
}

export function isAllowedVideoType(type: string): boolean {
  return Object.prototype.hasOwnProperty.call(VIDEO_EXTENSION_BY_TYPE, type)
}

export interface VideoUploadTarget {
  uploadUrl: string
  publicUrl: string
  path: string
}

/**
 * Mint a signed upload URL for a new video object. Returns `null` when Supabase
 * is not configured (local development) or the request fails.
 */
export async function createVideoUploadTarget(
  contentType: string,
): Promise<VideoUploadTarget | null> {
  if (!hasSupabase()) return null
  const extension = VIDEO_EXTENSION_BY_TYPE[contentType]
  if (!extension) return null

  const objectPath = `videos/${Date.now()}-${crypto.randomUUID()}${extension}`
  const supabase = getSupabase()

  const { data, error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .createSignedUploadUrl(objectPath)
  if (error || !data) {
    console.error("[videos] signed upload url failed:", error?.message)
    return null
  }

  const base = (process.env.SUPABASE_URL ?? "").replace(/\/+$/, "")
  const uploadUrl = data.signedUrl.startsWith("http")
    ? data.signedUrl
    : `${base}/storage/v1/${data.signedUrl.replace(/^\/+/, "")}`

  const { data: publicData } = supabase.storage
    .from(SUPABASE_BUCKET)
    .getPublicUrl(objectPath)

  return { uploadUrl, publicUrl: publicData.publicUrl, path: objectPath }
}

export type VideoSignResult =
  | { ok: true; uploadUrl: string; publicUrl: string }
  | { ok: false; error: string; status: number }

/**
 * Validate a browser's sign request and, if it passes, mint an upload URL.
 * Content type and size are re-checked here so a forged client cannot request a
 * signed URL for a huge file or an unexpected type.
 */
export async function signVideoUpload(body: {
  contentType?: unknown
  size?: unknown
}): Promise<VideoSignResult> {
  const contentType = String(body.contentType ?? "")
    .split(";")[0]
    .trim()
    .toLowerCase()
  const size = Number(body.size)

  if (!isAllowedVideoType(contentType)) {
    return { ok: false, error: "type", status: 415 }
  }
  if (!Number.isFinite(size) || size <= 0) {
    return { ok: false, error: "size", status: 400 }
  }
  if (size > MAX_VIDEO_SIZE) {
    return { ok: false, error: "too_large", status: 413 }
  }
  if (!hasSupabase()) {
    return { ok: false, error: "unavailable", status: 503 }
  }

  const target = await createVideoUploadTarget(contentType)
  if (!target) {
    return { ok: false, error: "sign_failed", status: 500 }
  }
  return { ok: true, uploadUrl: target.uploadUrl, publicUrl: target.publicUrl }
}

/**
 * Only accept video URLs that live in our own storage — either the Supabase
 * bucket or the local `/uploads` fallback — and carry a video extension. This
 * keeps arbitrary external URLs out of the database.
 */
export function isStoredVideoUrl(url: string): boolean {
  if (!url) return false
  const isBucket =
    /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\//i.test(
      url,
    ) || url.startsWith("/uploads/")
  if (!isBucket) return false
  return /\.(mp4|webm|mov|m4v)(?:[?#]|$)/i.test(url)
}
