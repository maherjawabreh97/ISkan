import { NextResponse } from "next/server"
import { countRecentUploads, recordUploads } from "@/lib/submissions-store"
import { signVideoUpload } from "@/lib/videos"

export const runtime = "nodejs"

const MAX_UPLOADS_PER_HOUR = 40

/** Defence in depth: reject cross-origin requests. */
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
 * Public video sign endpoint used by the "list your property" form. There is no
 * session, so abuse is bounded by a same-origin check and a per-IP hourly cap.
 * Uploaded videos stay private until an admin approves the submission.
 */
export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const ip = clientIp(request)
  if ((await countRecentUploads(ip, 60 * 60 * 1000)) >= MAX_UPLOADS_PER_HOUR) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 })
  }

  const result = await signVideoUpload(
    (body ?? {}) as { contentType?: unknown; size?: unknown },
  )
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    )
  }

  await recordUploads(ip, 1)
  return NextResponse.json({
    uploadUrl: result.uploadUrl,
    publicUrl: result.publicUrl,
  })
}
