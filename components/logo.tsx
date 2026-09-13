import Link from "next/link"
import Image from "next/image"

export function Logo({
  locale,
  name,
  onClick,
  compact = false,
}: {
  locale: string
  name: string
  onClick?: () => void
  compact?: boolean
}) {
  return (
    <Link
      href={`/${locale}`}
      onClick={onClick}
      aria-label={name}
      className="group flex shrink-0 items-center"
    >
      <Image
        src="/iskan-logo.png"
        alt={name}
        width={256}
        height={144}
        priority
        className={`w-auto object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)] transition-all duration-500 ${
          compact ? "h-11" : "h-9"
        }`}
      />
    </Link>
  )
}