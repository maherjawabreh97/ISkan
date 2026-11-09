"use client"

import { Toaster } from "sonner"

/**
 * Sonner handles the small, transient confirmations (favourite saved, listing
 * submitted). It renders in a portal, stacks without layout shift and is
 * announced to screen readers, which an inline "Saved!" label is not.
 */
export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      closeButton
      duration={2200}
      toastOptions={{
        classNames: {
          toast:
            "font-sans !rounded-2xl !border-slate-200/80 !bg-white !text-ink-900 !shadow-xl !shadow-ink-950/10",
          title: "!font-bold",
          description: "!text-slate-500",
        },
      }}
    />
  )
}
