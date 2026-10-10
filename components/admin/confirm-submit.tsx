"use client"

import { Trash2 } from "lucide-react"

export function ConfirmSubmit({
  message,
  label,
  className = "",
}: {
  message: string
  label: string
  className?: string
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (typeof window !== "undefined" && !window.confirm(message)) {
          event.preventDefault()
        }
      }}
    >
      <Trash2 className="size-4" />
      {label}
    </button>
  )
}
