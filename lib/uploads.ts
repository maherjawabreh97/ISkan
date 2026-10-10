import { promises as fs } from "node:fs"
import path from "node:path"
import crypto from "node:crypto"
import { getSupabase, hasSupabase, SUPABASE_BUCKET } from "./supabase"

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads")

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
])

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
}

const MAX_SIZE = 8 * 1024 * 1024

/**
 * Detect the real image type from the file's magic bytes. The MIME type sent by
 * the browser can be forged, so never trust it for validation.
 */
function sniffImageType(bytes: Buffer): string | null {
  if (bytes.length < 12) return null

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg"
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png"
  }

  // GIF: "GIF87a" / "GIF89a"
  const gif = bytes.toString("ascii", 0, 6)
  if (gif === "GIF87a" || gif === "GIF89a") return "image/gif"

  // WEBP: "RIFF" .... "WEBP"
  if (
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp"
  }

  // AVIF: "ftyp" box with an avif-family brand
  if (bytes.toString("ascii", 4, 8) === "ftyp") {
    const brand = bytes.toString("ascii", 8, 12)
    if (["avif", "avis", "mif1", "msf1"].includes(brand)) return "image/avif"
  }

  return null
}

/**
 * Extract the object path from a Supabase Storage public URL, e.g.
 * `https://x.supabase.co/storage/v1/object/public/property-images/a/b.jpg`
 * returns `a/b.jpg`.
 */
function storagePathFromUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${SUPABASE_BUCKET}/`
  const index = url.indexOf(marker)
  if (index === -1) return null
  return decodeURIComponent(url.slice(index + marker.length))
}

interface ValidatedFile {
  bytes: Buffer
  type: string
}

async function validate(files: File[]): Promise<ValidatedFile[]> {
  const items: ValidatedFile[] = []
  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) continue
    if (file.size > MAX_SIZE) continue
    const bytes = Buffer.from(await file.arrayBuffer())
    const type = sniffImageType(bytes)
    if (!type || !ALLOWED_TYPES.has(type)) continue
    items.push({ bytes, type })
  }
  return items
}

export async function saveUploads(files: File[]): Promise<string[]> {
  const items = await validate(files)
  if (items.length === 0) return []

  if (hasSupabase()) {
    const supabase = getSupabase()
    const urls: string[] = []
    for (const { bytes, type } of items) {
      const name = `${Date.now()}-${crypto.randomUUID()}${EXTENSION_BY_TYPE[type]}`
      const { error } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(name, bytes, { contentType: type, upsert: false })
      if (error) {
        console.error("[uploads] supabase upload failed:", error.message)
        continue
      }
      const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(name)
      urls.push(data.publicUrl)
    }
    return urls
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true })
  const urls: string[] = []
  for (const { bytes, type } of items) {
    const name = `${Date.now()}-${crypto.randomUUID()}${EXTENSION_BY_TYPE[type]}`
    await fs.writeFile(path.join(UPLOAD_DIR, name), bytes)
    urls.push(`/uploads/${name}`)
  }
  return urls
}

export async function deleteUpload(url: string): Promise<void> {
  if (hasSupabase()) {
    const objectPath = storagePathFromUrl(url)
    if (objectPath) {
      const { error } = await getSupabase()
        .storage.from(SUPABASE_BUCKET)
        .remove([objectPath])
      if (error) console.error("[uploads] supabase remove failed:", error.message)
    }
  }

  // Legacy / local files (also handles a project still using disk storage).
  if (!url.startsWith("/uploads/")) return
  const file = path.join(UPLOAD_DIR, path.basename(url))
  await fs.rm(file, { force: true })
}

export async function deleteUploads(urls: string[]): Promise<void> {
  await Promise.all(urls.map((url) => deleteUpload(url)))
}
