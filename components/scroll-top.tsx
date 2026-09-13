"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"

export function ScrollTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      className={`fixed end-6 bottom-6 z-40 grid size-11 place-items-center rounded-full bg-brand-600 text-white shadow-xl shadow-brand-900/30 ring-1 ring-white/20 transition duration-300 hover:bg-brand-500 ${
        show
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <ArrowUp className="size-5" />
    </button>
  )
}