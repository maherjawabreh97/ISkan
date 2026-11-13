"use client"

import { useMemo, useState } from "react"
import { Calculator, TrendingUp, Wallet, Percent } from "lucide-react"
import type { Locale } from "@/lib/i18n"

const nf = (value: number, maximumFractionDigits = 0) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(
    Number.isFinite(value) ? value : 0,
  )

/**
 * Mortgage + rental-yield calculator.
 *
 * Entirely client-side: nothing is submitted, so a visitor can experiment with
 * numbers without leaving any data behind.
 */
export function InvestmentCalculator({ locale }: { locale: Locale }) {
  const isAr = locale === "ar"

  const [price, setPrice] = useState(4_000_000)
  const [downPct, setDownPct] = useState(30)
  const [rate, setRate] = useState(2.79)
  const [years, setYears] = useState(10)
  const [rent, setRent] = useState(20_000)
  const [appreciation, setAppreciation] = useState(8)

  const result = useMemo(() => {
    const down = (price * downPct) / 100
    const loan = Math.max(price - down, 0)
    const months = Math.max(years * 12, 1)
    const monthlyRate = rate / 100

    const monthlyPayment =
      monthlyRate > 0
        ? (loan * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
        : loan / months

    const totalPaid = monthlyPayment * months
    const totalInterest = Math.max(totalPaid - loan, 0)

    const grossYield = price > 0 ? (rent * 12 * 100) / price : 0
    const netYield = price > 0 ? ((rent * 12 - price * 0.01) * 100) / price : 0
    const payback = rent > 0 ? price / (rent * 12) : 0

    const futureValue = price * Math.pow(1 + appreciation / 100, years)
    const capitalGain = futureValue - price

    const monthlyCashflow = rent - monthlyPayment

    return {
      down,
      loan,
      monthlyPayment,
      totalPaid,
      totalInterest,
      grossYield,
      netYield,
      payback,
      futureValue,
      capitalGain,
      monthlyCashflow,
    }
  }, [price, downPct, rate, years, rent, appreciation])

  const field =
    "w-full rounded-xl border-0 bg-sand-100 px-3.5 py-2.5 text-sm font-bold text-ink-900 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-brand-600"
  const label = "mb-1.5 block text-xs font-extrabold text-slate-500"

  const metrics = [
    {
      icon: Wallet,
      label: isAr ? "الدفعة الشهرية" : "Monthly payment",
      value: `${nf(result.monthlyPayment)} ₺`,
      tone: "text-brand-700",
    },
    {
      icon: Percent,
      label: isAr ? "العائد الإيجاري (إجمالي)" : "Gross rental yield",
      value: `${nf(result.grossYield, 2)}%`,
      tone: "text-emerald-600",
    },
    {
      icon: TrendingUp,
      label: isAr ? "استرداد رأس المال" : "Payback period",
      value: `${nf(result.payback, 1)} ${isAr ? "سنة" : "yrs"}`,
      tone: "text-ink-900",
    },
    {
      icon: Calculator,
      label: isAr ? "القيمة بعد الفترة" : "Value after period",
      value: `${nf(result.futureValue)} ₺`,
      tone: "text-gold-600",
    },
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
      {/* Inputs */}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
        <h2 className="font-heading text-base font-bold text-ink-900">
          {isAr ? "بيانات العقار والتمويل" : "Property & financing"}
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={label} htmlFor="calc-price">
              {isAr ? "سعر العقار (₺)" : "Property price (₺)"}
            </label>
            <input
              id="calc-price"
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className={field}
            />
          </div>

          <div>
            <label className={label} htmlFor="calc-down">
              {isAr ? "الدفعة الأولى (%)" : "Down payment (%)"}
            </label>
            <input
              id="calc-down"
              type="number"
              min={0}
              max={100}
              value={downPct}
              onChange={(e) => setDownPct(Number(e.target.value))}
              className={field}
            />
          </div>

          <div>
            <label className={label} htmlFor="calc-rate">
              {isAr ? "الفائدة الشهرية (%)" : "Monthly interest (%)"}
            </label>
            <input
              id="calc-rate"
              type="number"
              min={0}
              step={0.01}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className={field}
            />
          </div>

          <div>
            <label className={label} htmlFor="calc-years">
              {isAr ? "مدة القرض (سنوات)" : "Loan term (years)"}
            </label>
            <input
              id="calc-years"
              type="number"
              min={1}
              max={30}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className={field}
            />
          </div>

          <div>
            <label className={label} htmlFor="calc-rent">
              {isAr ? "الإيجار الشهري (₺)" : "Monthly rent (₺)"}
            </label>
            <input
              id="calc-rent"
              type="number"
              min={0}
              value={rent}
              onChange={(e) => setRent(Number(e.target.value))}
              className={field}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={label} htmlFor="calc-appr">
              {isAr
                ? "نمو قيمة العقار السنوي (%)"
                : "Annual appreciation (%)"}
            </label>
            <input
              id="calc-appr"
              type="number"
              min={0}
              step={0.5}
              value={appreciation}
              onChange={(e) => setAppreciation(Number(e.target.value))}
              className={field}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-sand-100 text-brand-700">
                <m.icon className="size-4.5" />
              </span>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                {m.label}
              </p>
              <p className={`mt-1 font-heading text-lg font-bold ${m.tone}`}>
                {m.value}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-ink-950 p-5 text-white">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/50">
            {isAr ? "التدفق النقدي الشهري" : "Monthly cash flow"}
          </p>
          <p
            className={`mt-1 font-heading text-2xl font-bold ${
              result.monthlyCashflow >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {nf(result.monthlyCashflow)} ₺
          </p>
          <p className="mt-2 text-xs leading-6 text-white/60">
            {isAr
              ? `الإيجار ${nf(rent)} ₺ ناقص الدفعة الشهرية ${nf(result.monthlyPayment)} ₺.`
              : `Rent ${nf(rent)} ₺ minus the monthly payment ${nf(result.monthlyPayment)} ₺.`}
          </p>

          <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-xs">
            <div>
              <dt className="text-white/50">
                {isAr ? "الدفعة الأولى" : "Down payment"}
              </dt>
              <dd className="mt-0.5 font-bold">{nf(result.down)} ₺</dd>
            </div>
            <div>
              <dt className="text-white/50">{isAr ? "مبلغ القرض" : "Loan"}</dt>
              <dd className="mt-0.5 font-bold">{nf(result.loan)} ₺</dd>
            </div>
            <div>
              <dt className="text-white/50">
                {isAr ? "إجمالي الفوائد" : "Total interest"}
              </dt>
              <dd className="mt-0.5 font-bold">{nf(result.totalInterest)} ₺</dd>
            </div>
            <div>
              <dt className="text-white/50">
                {isAr ? "نمو رأس المال" : "Capital gain"}
              </dt>
              <dd className="mt-0.5 font-bold">{nf(result.capitalGain)} ₺</dd>
            </div>
          </dl>
        </div>

        <p className="px-1 text-[11px] leading-5 text-slate-400">
          {isAr
            ? "أرقام تقديرية للاسترشاد فقط وليست عرضاً تمويلياً. تختلف الشروط حسب البنك والمطوّر."
            : "Estimates for guidance only, not a financing offer. Terms vary by bank and developer."}
        </p>
      </div>
    </div>
  )
}
