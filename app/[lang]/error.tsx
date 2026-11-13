"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error)
  }, [error])

  const pathname = usePathname() || "/"
  const isAr = pathname.split("/")[1] === "ar"
  const t = isAr
    ? {
        title: "حدث خطأ غير متوقع",
        desc: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
        retry: "إعادة المحاولة",
        home: "الرئيسية",
        homeHref: "/ar",
      }
    : {
        title: "Something went wrong",
        desc: "An unexpected error occurred. Please try again.",
        retry: "Try again",
        home: "Home",
        homeHref: "/en",
      }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-5 text-center">
      <h2 className="font-heading text-2xl font-bold text-ink-900">{t.title}</h2>
      <p className="max-w-md text-sm text-slate-500">{t.desc}</p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          {t.retry}
        </button>
        <Link
          href={t.homeHref}
          className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-bold text-ink-900 transition hover:border-brand-400"
        >
          {t.home}
        </Link>
      </div>
    </div>
  )
}
