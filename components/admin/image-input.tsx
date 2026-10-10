"use client"

import Image from "next/image"
import { useRef, useState } from "react"
import { ImagePlus, X } from "lucide-react"

export function ImageInput({
  label,
  help,
  removeLabel,
  emptyLabel,
  existing = [],
}: {
  label: string
  help: string
  removeLabel: string
  emptyLabel: string
  existing?: string[]
}) {
  const [uploaded, setUploaded] = useState<string[]>([])
  const [removed, setRemoved] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
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
      const data = new FormData()
      Array.from(files).forEach((file) => data.append("files", file))
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      })
      if (!response.ok) throw new Error("failed")
      const json = (await response.json()) as { urls?: string[] }
      setUploaded((prev) => [...prev, ...(json.urls ?? [])])
    } catch {
      setError("⚠︎")
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div>
      <p className="mb-1.5 block text-xs font-extrabold text-slate-500">
        {label}
      </p>

      {existing.length > 0 && (
        <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {existing.map((url) => {
            const isRemoved = removed.includes(url)
            return (
              <label
                key={url}
                className={`group relative block aspect-[4/3] cursor-pointer overflow-hidden rounded-2xl ring-1 transition ${
                  isRemoved
                    ? "opacity-40 ring-2 ring-red-400"
                    : "ring-slate-200 hover:ring-brand-400"
                }`}
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="200px"
                  className="object-cover"
                />
                <input type="hidden" name="existingImages" value={url} />
                <input
                  type="checkbox"
                  name="removeImage"
                  value={url}
                  checked={isRemoved}
                  onChange={() => toggleRemoved(url)}
                  className="absolute end-2 top-2 size-4 accent-red-500"
                />
                <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-ink-950/70 px-2 py-1 text-center text-[10px] font-bold text-white">
                  {isRemoved ? removeLabel : ""}
                </span>
              </label>
            )
          })}
        </div>
      )}

      {uploaded.length > 0 && (
        <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {uploaded.map((url) => (
            <div
              key={url}
              className="relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-emerald-300"
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="200px"
                className="object-cover"
              />
              <input type="hidden" name="newImages" value={url} />
              <button
                type="button"
                onClick={() =>
                  setUploaded((prev) => prev.filter((item) => item !== url))
                }
                className="absolute end-2 top-2 grid size-6 place-items-center rounded-full bg-red-500 text-white"
                aria-label={removeLabel}
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {existing.length === 0 && uploaded.length === 0 && (
        <p className="mb-3 text-xs font-semibold text-slate-400">{emptyLabel}</p>
      )}

      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-sand-50 px-4 py-5 text-sm font-extrabold text-slate-600 transition hover:border-brand-400 hover:text-brand-700">
        <ImagePlus className="size-4" />
        {busy ? "…" : help}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => onFiles(event.target.files)}
          className="hidden"
        />
      </label>
      {error && <p className="mt-2 text-xs font-bold text-red-600">{error}</p>}
    </div>
  )
}
