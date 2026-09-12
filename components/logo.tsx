import Link from "next/link"
import { Building2 } from "lucide-react"

export function Logo({
  locale,
  name,
  onClick,
}: {
  locale: string
  name: string
  onClick?: () => void
}) {
  return (
    <Link
      href={`/${locale}`}
      onClick={onClick}
      className="flex shrink-0 items-center gap-2.5"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-950/30 ring-1 ring-white/20">
        <Building2 className="size-5" strokeWidth={2.2} />
      </span>
      <span className="leading-none">
        <span className="block text-base font-extrabold tracking-tight text-white sm:text-lg">
          {name}
        </span>
        <span className="mt-1 block h-0.5 w-8 bg-gradient-to-r from-gold-400 to-transparent" />
      </span>
    </Link>
  )
}