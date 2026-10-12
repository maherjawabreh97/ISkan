"use client"

import { useRef, useState } from "react"
import { Trash2, Video as VideoIcon } from "lucide-react"

const ACCEPT = "video/mp4,video/webm,video/quicktime"
const MAX_SIZE = 50 * 1024 * 1024

const TYPE_BY_EXTENSION: Record<string, string> = {
  mp4: "video/mp4",
  m4v: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
}

/** Some systems report an empty MIME type, so fall back to the extension. */
function resolveContentType(file: File): string {
  if (file.type && ACCEPT.split(",").includes(file.type)) return file.type
  const extension = file.name.split(".").pop()?.toLowerCase() ?? ""
  return TYPE_BY_EXTENSION[extension] ?? ""
}

/** PUT the file straight to Supabase Storage with an upload-progress callback. */
function putWithProgress(
  url: string,
  file: File,
  contentType: string,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("PUT", url)
    xhr.setRequestHeader("Content-Type", contentType)
    xhr.setRequestHeader("x-upsert", "false")
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(String(xhr.status)))
    }
    xhr.onerror = () => reject(new Error("network"))
    xhr.send(file)
  })
}

export function VideoInput({
  label,
  help,
  emptyLabel,
  removeLabel,
  errorLabel = "⚠︎",
  existing = [],
  endpoint,
}: {
  label: string
  help: string
  emptyLabel: string
  removeLabel: string
  errorLabel?: string
  existing?: string[]
  /** Sign endpoint used to obtain the direct-to-storage upload URL. */
  endpoint: string
}) {
  const [uploaded, setUploaded] = useState<string[]>([])
  const [removed, setRemoved] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const toggleRemoved = (url: string) =>
    setRemoved((prev) =>
      prev.includes(url) ? prev.filter((item) => item !== url) : [...prev, url],
    )

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setBusy(true)
    setError("")

    try {
      for (const file of Array.from(files)) {
        const contentType = resolveContentType(file)
        if (!contentType || file.size > MAX_SIZE) {
          setError(errorLabel)
          continue
        }

        const signResponse = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentType, size: file.size }),
        })
        if (!signResponse.ok) {
          setError(errorLabel)
          continue
        }

        const sign = (await signResponse.json()) as {
          uploadUrl?: string
          publicUrl?: string
        }
        if (!sign.uploadUrl || !sign.publicUrl) {
          setError(errorLabel)
          continue
        }

        setProgress(0)
        await putWithProgress(sign.uploadUrl, file, contentType, setProgress)
        setUploaded((prev) => [...prev, sign.publicUrl as string])
      }
    } catch {
      setError(errorLabel)
    } finally {
      setBusy(false)
      setProgress(0)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div>
      <p className="mb-1.5 block text-xs font-extrabold text-slate-500">
        {label}
      </p>

      {existing.length > 0 && (
        <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {existing.map((url) => {
            const isRemoved = removed.includes(url)
            return (
              <label
                key={url}
                className={`group relative block overflow-hidden rounded-2xl ring-1 transition ${
                  isRemoved
                    ? "opacity-40 ring-2 ring-red-400"
                    : "ring-slate-200 hover:ring-brand-400"
                }`}
              >
                <video
                  src={url}
                  muted
                  playsInline
                  preload="metadata"
                  className="pointer-events-none aspect-video w-full bg-ink-950 object-cover"
                />
                <input type="hidden" name="existingVideos" value={url} />
                <input
                  type="checkbox"
                  name="removeVideo"
                  value={url}
                  checked={isRemoved}
                  onChange={() => toggleRemoved(url)}
                  className="absolute end-2 top-2 size-4 accent-red-500"
                />
                {isRemoved && (
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-ink-950/70 px-2 py-1 text-center text-[10px] font-bold text-white">
                    {removeLabel}
                  </span>
                )}
              </label>
            )
          })}
        </div>
      )}

      {uploaded.length > 0 && (
        <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {uploaded.map((url) => (
            <div
              key={url}
              className="relative overflow-hidden rounded-2xl ring-1 ring-emerald-300"
            >
              <video
                src={url}
                controls
                playsInline
                preload="metadata"
                className="aspect-video w-full bg-ink-950 object-cover"
              />
              <input type="hidden" name="newVideos" value={url} />
              <button
                type="button"
                onClick={() =>
                  setUploaded((prev) => prev.filter((item) => item !== url))
                }
                className="absolute end-2 top-2 grid size-6 place-items-center rounded-full bg-red-500 text-white"
                aria-label={removeLabel}
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {existing.length === 0 && uploaded.length === 0 && (
        <p className="mb-3 text-xs font-semibold text-slate-400">{emptyLabel}</p>
      )}

      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-sand-50 px-4 py-5 text-sm font-extrabold text-slate-600 transition hover:border-brand-400 hover:text-brand-700">
        <VideoIcon className="size-4" />
        {busy ? `${progress}%` : help}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          onChange={(event) => onFiles(event.target.files)}
          className="hidden"
        />
      </label>

      {busy && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-sand-200">
          <div
            className="h-full rounded-full bg-brand-600 transition-[width] duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && <p className="mt-2 text-xs font-bold text-red-600">{error}</p>}
    </div>
  )
}
