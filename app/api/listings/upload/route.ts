import { NextResponse } from "next/server"
import { countRecentUploads, recordUploads } from "@/lib/submissions-store"
import { saveUploads } from "@/lib/uploads"

// Uses Buffer / node:fs, so it must run on the Node.js runtime.
export const runtime = "nodejs"

const MAX_FILES = 6
const MAX_UPLOADS_PER_HOUR = 40

/** Defence in depth: reject cross-origin uploads. */
function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin")
  if (!origin) return true
  const host = request.headers.get("host")
  if (!host) return false
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  )
}

/**
 * Public image upload used by the "list your property" form. There is no
 * session here, so abuse is bounded by a same-origin check and a per-IP hourly
 * cap. Files are only stored — they are never published until an admin
 * approves the submission they belong to.
 */
export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const ip = clientIp(request)
  if ((await countRecentUploads(ip, 60 * 60 * 1000)) >= MAX_UPLOADS_PER_HOUR) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 })
  }

  const files = formData
    .getAll("files")
    .filter((value): value is File => value instanceof File)
    .slice(0, MAX_FILES)

  const urls = await saveUploads(files)
  if (urls.length > 0) await recordUploads(ip, urls.length)
  return NextResponse.json({ urls })
}
