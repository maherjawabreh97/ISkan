"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Home,
  KeyRound,
  MapPin,
  Sparkles,
  Wallet,
} from "lucide-react"
import type { Dictionary } from "@/lib/dictionaries/types"
import type { Locale } from "@/lib/i18n"

type Purpose = "sale" | "rent"
type Step = 0 | 1 | 2 | 3

/**
 * Three-question property matcher.
 *
 * It builds a normal `/properties` URL from the answers, so the result page is
 * shareable, bookmarkable and works without any server round-trip here.
 */
export function PropertyMatch({
  locale,
  dict,
}: {
  locale: Locale
  dict: Dictionary
}) {
  const isAr = locale === "ar"
  const [step, setStep] = useState<Step>(0)
  const [purpose, setPurpose] = useState<Purpose>("sale")
  const [type, setType] = useState<string>("all")
  const [city, setCity] = useState<string>("all")
  const [budget, setBudget] = useState<string>("")

  const typeOptions = useMemo(
    () => Object.entries(dict.propertyTypes) as Array<[string, string]>,
    [dict.propertyTypes],
  )

  const cityOptions = useMemo(
    () => Object.entries(dict.cities) as Array<[string, string]>,
    [dict.cities],
  )

  const href = useMemo(() => {
    const params = new URLSearchParams()
    params.set("purpose", purpose)
    if (type !== "all") params.set("type", type)
    if (city !== "all") params.set("city", city)
    if (budget) params.set("maxPrice", budget)
    return `/${locale}/properties?${params.toString()}`
  }, [locale, purpose, type, city, budget])

  const steps = [
    isAr ? "الهدف" : "Goal",
    isAr ? "نوع العقار" : "Type",
    isAr ? "الحي" : "District",
    isAr ? "الميزانية" : "Budget",
  ]

  const optionCls = (active: boolean) =>
    `flex items-center gap-3 rounded-2xl border p-4 text-start transition ${
      active
        ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/30"
        : "border-slate-200 bg-white hover:border-brand-300"
    }`

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-7">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {steps.map((label, index) => {
          const done = index < step
          const active = index === step
          return (
            <div key={label} className="flex flex-1 items-center gap-2">
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                  done
                    ? "bg-emerald-500 text-white"
                    : active
                      ? "bg-brand-600 text-white"
                      : "bg-sand-100 text-slate-400"
                }`}
              >
                {done ? <Check className="size-3.5" /> : index + 1}
              </span>
              <span
                className={`hidden text-xs font-bold sm:block ${
                  active ? "text-ink-900" : "text-slate-400"
                }`}
              >
                {label}
              </span>
              {index < steps.length - 1 && (
                <span className="hidden h-px flex-1 bg-slate-200 sm:block" />
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-6 min-h-[16rem]">
        {step === 0 && (
          <div>
            <h2 className="font-heading text-lg font-bold text-ink-900">
              {isAr ? "ما هدفك؟" : "What is your goal?"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isAr ? "اختر نوع العملية." : "Choose the transaction type."}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPurpose("sale")}
                className={optionCls(purpose === "sale")}
              >
                <span className="grid size-10 place-items-center rounded-xl bg-gold-200/70 text-gold-600">
                  <Home className="size-5" />
                </span>
                <span>
                  <span className="block font-heading text-sm font-bold text-ink-900">
                    {dict.common.forSale}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {isAr ? "تملّك عقار" : "Own a property"}
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setPurpose("rent")}
                className={optionCls(purpose === "rent")}
              >
                <span className="grid size-10 place-items-center rounded-xl bg-brand-100 text-brand-700">
                  <KeyRound className="size-5" />
                </span>
                <span>
                  <span className="block font-heading text-sm font-bold text-ink-900">
                    {dict.common.forRent}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {isAr ? "استئجار" : "Rent a home"}
                  </span>
                </span>
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="font-heading text-lg font-bold text-ink-900">
              {isAr ? "ما نوع العقار؟" : "Which property type?"}
            </h2>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setType("all")}
                className={optionCls(type === "all")}
              >
                <Building2 className="size-4.5 text-brand-600" />
                <span className="font-heading text-sm font-bold text-ink-900">
                  {dict.common.allTypes}
                </span>
              </button>
              {typeOptions.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setType(key)}
                  className={optionCls(type === key)}
                >
                  <Building2 className="size-4.5 text-brand-600" />
                  <span className="font-heading text-sm font-bold text-ink-900">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-heading text-lg font-bold text-ink-900">
              {isAr ? "ما الحي الذي تفضّله؟" : "Which district?"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isAr ? "اختر حياً أو اتركه مفتوحاً." : "Pick a district or leave it open."}
            </p>
            <div className="mt-4">
              <div className="relative">
                <MapPin className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="w-full rounded-xl border-0 bg-sand-100 py-3 pe-3.5 ps-9 text-sm font-bold text-ink-900 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-brand-600"
                >
                  <option value="all">{dict.common.allCities}</option>
                  {cityOptions.map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="font-heading text-lg font-bold text-ink-900">
              {isAr ? "ما ميزانيتك القصوى؟" : "What is your maximum budget?"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isAr
                ? "اتركه فارغاً لعرض كل الأسعار."
                : "Leave it empty to see every price."}
            </p>
            <div className="relative mt-4">
              <Wallet className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                min={0}
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                placeholder={isAr ? "مثال: 300000" : "e.g. 300000"}
                className="w-full rounded-xl border-0 bg-sand-100 py-3 pe-3.5 ps-9 text-sm font-bold text-ink-900 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-brand-600"
              />
            </div>

            <Link
              href={href}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
            >
              <Sparkles className="size-4" />
              {isAr ? "اعرض العقارات المطابقة" : "Show matching properties"}
            </Link>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => setStep((current) => (current > 0 ? ((current - 1) as Step) : current))}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-slate-500 transition hover:text-ink-900 disabled:opacity-0"
        >
          <ArrowLeft className="size-4 rtl:-scale-x-100" />
          {isAr ? "السابق" : "Back"}
        </button>

        {step < 3 && (
          <button
            type="button"
            onClick={() => setStep((current) => ((current + 1) as Step))}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-ink-800"
          >
            {isAr ? "التالي" : "Next"}
            <ArrowRight className="size-4 rtl:-scale-x-100" />
          </button>
        )}
      </div>
    </div>
  )
}
