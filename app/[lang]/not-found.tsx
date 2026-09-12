import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center">
      <p className="text-8xl font-black text-brand-700">404</p>
      <h1 className="mt-4 text-2xl font-extrabold text-ink-900">404</h1>
      <p className="mt-2 text-base font-bold text-slate-500" dir="rtl">
        الصفحة غير موجودة
      </p>
      <p className="mt-1 text-sm text-slate-400" dir="ltr">
        Page not found
      </p>
      <Link
        href="/ar"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-700/20 transition hover:bg-brand-500"
      >
        العودة للرئيسية
        <ArrowUpRight className="size-4 rtl:-scale-x-100" />
      </Link>
    </div>
  )
}