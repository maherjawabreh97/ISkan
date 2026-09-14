import Link from "next/link"
import { ArrowUpRight, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="relative overflow-hidden bg-ink-950 py-24 text-white">
      <div className="bg-grid-dark absolute inset-0 opacity-50" />
      <div className="absolute -end-24 top-0 size-72 rounded-full bg-brand-600/20 blur-3xl" />
      <div className="absolute -start-20 bottom-0 size-72 rounded-full bg-gold-500/15 blur-3xl" />
      <div className="relative mx-auto flex max-w-lg flex-col items-center px-4 text-center">
        <span className="inline-flex size-20 shrink-0 place-items-center rounded-full bg-brand-600/20 text-6xl font-black text-brand-400">
          404
        </span>
        <h1 className="mt-6 text-3xl font-black">
          الصفحة غير موجودة
        </h1>
        <p className="mt-3 text-base font-semibold text-white/60">
          الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Link
            href="/ar"
            className="btn-gold inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-extrabold"
          >
            <Home className="size-4" />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  )
}