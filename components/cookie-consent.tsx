"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { Locale } from "@/lib/i18n"

const STORAGE_KEY = "iskan:cookie-consent"

export function CookieConsent({ locale }: { locale: Locale }) {
  const [show, setShow] = useState(false)
  const [customize, setCustomize] = useState(false)
  const [analytics, setAnalytics] = useState(true)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (!stored) setShow(true)
    } catch {
      setShow(true)
    }
  }, [])

  const save = (value: string) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value)
    } catch {
      /* ignore */
    }
    setShow(false)
  }

  if (!show) return null

  const ar = locale === "ar"
  const t = ar
    ? {
        title: "نستخدم ملفات تعريف الارتباط",
        body: "يستخدم هذا الموقع ملفات تعريف الارتباط لتحسين تجربة المستخدم وتحليل الزيارات.",
        policy: "سياسة ملفات تعريف الارتباط",
        necessary: "الضرورية فقط",
        accept: "قبول الكل",
        customize: "تخصيص",
        analytics: "ملفات تحليلية",
        save: "حفظ الإعدادات",
        more: "مزيد من التفاصيل",
      }
    : {
        title: "We use cookies",
        body: "This site uses cookies to improve your experience and analyze traffic.",
        policy: "Cookie policy",
        necessary: "Necessary only",
        accept: "Accept all",
        customize: "Customize",
        analytics: "Analytics cookies",
        save: "Save settings",
        more: "More details",
      }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-slate-200 bg-white/95 p-4 shadow-luxe backdrop-blur sm:p-5">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="font-heading text-sm font-bold text-ink-900">{t.title}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {t.body}{" "}
              <Link
                href={`/${locale}/cookies`}
                className="font-bold text-brand-700 underline"
              >
                {t.policy}
              </Link>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => save("necessary")}
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-bold text-ink-900 transition hover:border-brand-400"
            >
              {t.necessary}
            </button>
            <button
              type="button"
              onClick={() => setCustomize((v) => !v)}
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-bold text-ink-900 transition hover:border-brand-400"
            >
              {t.customize}
            </button>
            <button
              type="button"
              onClick={() => save("all")}
              className="rounded-full bg-brand-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-700"
            >
              {t.accept}
            </button>
          </div>
        </div>
        {customize && (
          <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <input type="checkbox" checked disabled className="accent-brand-600" />
              {t.necessary}
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="accent-brand-600"
              />
              {t.analytics}
            </label>
            <button
              type="button"
              onClick={() => save(analytics ? "all" : "necessary")}
              className="ms-auto rounded-full bg-brand-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-700"
            >
              {t.save}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
