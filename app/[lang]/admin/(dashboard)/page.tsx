import Link from "next/link"
import {
  ArrowUpRight,
  BadgeDollarSign,
  Building2,
  House,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { getAdminDict } from "@/lib/dictionaries/admin"
import { formatPrice } from "@/lib/format"
import { hasLocale, type Locale } from "@/lib/i18n"
import { getProperties } from "@/lib/properties-store"
import { getUsers } from "@/lib/users-store"
import { notFound } from "next/navigation"

type PageProps = {
  params: Promise<{ lang: string }>
}

export default async function AdminDashboardPage({ params }: PageProps) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const t = getAdminDict(locale)

  const user = await getCurrentUser()
  const properties = await getProperties()
  const saleCount = properties.filter((p) => p.purpose === "sale").length
  const rentCount = properties.filter((p) => p.purpose === "rent").length
  const usersCount = user?.role === "admin" ? (await getUsers()).length : null
  const recent = properties.slice(0, 5)

  const stats = [
    {
      key: "total",
      label: t.dashboard.totalProperties,
      value: properties.length,
      icon: Building2,
      tone: "text-brand-700 bg-brand-50",
    },
    {
      key: "sale",
      label: t.dashboard.forSale,
      value: saleCount,
      icon: BadgeDollarSign,
      tone: "text-gold-600 bg-gold-400/20",
    },
    {
      key: "rent",
      label: t.dashboard.forRent,
      value: rentCount,
      icon: House,
      tone: "text-emerald-700 bg-emerald-50",
    },
    ...(usersCount !== null
      ? [
          {
            key: "users",
            label: t.dashboard.totalUsers,
            value: usersCount,
            icon: Users,
            tone: "text-slate-700 bg-slate-100",
          },
        ]
      : []),
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-gold-300">
            {t.dashboard.welcome}، {user?.name}
          </p>
          <h1 className="mt-1 text-3xl font-black text-white">
            {t.dashboard.title}
          </h1>
          <p className="mt-1 text-sm font-semibold text-white/50">
            {t.dashboard.subtitle}
          </p>
        </div>
        <Link
          href={`/${locale}/admin/properties/new`}
          className="btn-gold inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-black text-ink-950 transition hover:brightness-105"
        >
          <Plus className="size-4" />
          {t.dashboard.addProperty}
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.key}
              className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70"
            >
              <span
                className={`inline-grid size-11 place-items-center rounded-2xl ${stat.tone}`}
              >
                <Icon className="size-5" />
              </span>
              <p className="mt-4 text-3xl font-black text-ink-900">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-extrabold text-slate-500">
                {stat.label}
              </p>
            </div>
          )
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href={`/${locale}/admin/properties`}
          className="group flex items-center justify-between rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 transition hover:ring-brand-400"
        >
          <span className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-brand-600/10 text-brand-700">
              <Building2 className="size-5" />
            </span>
            <span className="text-sm font-extrabold text-ink-900">
              {t.dashboard.manageProperties}
            </span>
          </span>
          <ArrowUpRight className="size-5 text-slate-400 transition group-hover:text-brand-700 rtl:-scale-x-100" />
        </Link>

        {user?.role === "admin" && (
          <Link
            href={`/${locale}/admin/users`}
            className="group flex items-center justify-between rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 transition hover:ring-brand-400"
          >
            <span className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-gold-400/20 text-gold-600">
                <ShieldCheck className="size-5" />
              </span>
              <span className="text-sm font-extrabold text-ink-900">
                {t.dashboard.manageUsers}
              </span>
            </span>
            <ArrowUpRight className="size-5 text-slate-400 transition group-hover:text-brand-700 rtl:-scale-x-100" />
          </Link>
        )}
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
        <h2 className="mb-4 text-lg font-black text-ink-900">
          {t.dashboard.recent}
        </h2>
        {recent.length === 0 ? (
          <p className="py-6 text-center text-sm font-semibold text-slate-400">
            {t.dashboard.empty}
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recent.map((property) => (
              <Link
                key={property.slug}
                href={`/${locale}/admin/properties/${property.slug}`}
                className="flex items-center justify-between gap-4 py-3 transition hover:opacity-80"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-ink-900">
                    {property.name[locale]}
                  </p>
                  <p className="text-xs font-semibold text-slate-400">
                    {property.address[locale]}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-black text-brand-700">
                  {formatPrice(property.price, property.currency ?? "TRY")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
