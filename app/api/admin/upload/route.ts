import { NextResponse } from "next/server"
import { getCurrentUser, hasRole } from "@/lib/auth"
import { saveUploads } from "@/lib/uploads"

// Uses Buffer / node:fs, so it must run on the Node.js runtime.
export const runtime = "nodejs"

/**
 * Defence in depth against CSRF for this cookie-authenticated endpoint.
 * Server Actions already get origin checking from Next; route handlers do not.
 */
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

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const user = await getCurrentUser()
  if (!hasRole(user, ["admin", "editor"])) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const files = formData
    .getAll("files")
    .filter((value): value is File => value instanceof File)

  const urls = await saveUploads(files)
  return NextResponse.json({ urls })
}
