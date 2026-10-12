import { NextResponse } from "next/server"
import { getCurrentUser, hasRole } from "@/lib/auth"
import { signVideoUpload } from "@/lib/videos"

export const runtime = "nodejs"

/** Defence in depth against CSRF for this cookie-authenticated endpoint. */
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

/**
 * Mints a short-lived signed upload URL so the admin's browser can PUT a video
 * straight into Supabase Storage. The file itself never reaches the Worker.
 */
export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const user = await getCurrentUser()
  if (!hasRole(user, ["admin", "editor"])) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
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

  return NextResponse.json({
    uploadUrl: result.uploadUrl,
    publicUrl: result.publicUrl,
  })
}
