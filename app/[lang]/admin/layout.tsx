import type { Metadata } from "next"

export const metadata: Metadata = {
  // The public [lang] layout appends "| Iskan", so keep this bare to avoid
  // rendering "Dashboard | Iskan | Iskan".
  title: "Dashboard",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
