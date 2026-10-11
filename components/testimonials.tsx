"use client"

import { useActionState, useCallback, useEffect, useState } from "react"
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MessageSquarePlus,
  Quote,
  Send,
  Star,
  X,
} from "lucide-react"
import {
  submitTestimonialAction,
  type TestimonialFormState,
} from "@/app/[lang]/(site)/actions"
import { TurnstileWidget } from "@/components/admin/turnstile-widget"
import type { Dictionary } from "@/lib/dictionaries/types"
import type { Locale } from "@/lib/i18n"

type Testimonial = {
  quote: string
  name: string
  role: string
}

const inputCls =
  "w-full rounded-xl border-0 bg-sand-100 px-3.5 py-2.5 text-sm font-semibold text-ink-900 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-brand-600"
const labelCls = "mb-1.5 block text-xs font-extrabold text-slate-500"

/** Visitor review form: hidden behind a toggle so the landing page stays light. */
function TestimonialForm({
  t,
  siteKey,
}: {
  t: Dictionary["testimonials"]
  siteKey: string
}) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(
    submitTestimonialAction,
    { status: "idle" } as TestimonialFormState,
  )

  if (state.status === "success") {
    return (
      <div className="mx-auto mt-12 max-w-2xl rounded-3xl bg-white p-8 text-center shadow-soft ring-1 ring-slate-200/70">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="size-7" />
        </span>
        <h3 className="mt-4 text-xl font-black text-ink-900">
          {t.successTitle}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-relaxed text-slate-500">
          {t.successBody}
        </p>
      </div>
    )
  }

  const error =
    state.status === "error"
      ? state.code === "rate"
        ? t.errorRate
        : t.errorRequired
      : ""

  return (
    <div className="mx-auto mt-12 max-w-2xl">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-brand inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-extrabold text-white transition hover:brightness-105"
        >
          <MessageSquarePlus className="size-4" />
          {t.addCta}
        </button>
      ) : (
        <form
          action={action}
          className="relative rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-200/70 sm:p-8"
        >
          {/* Honeypot: hidden from humans, irresistible to bots. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-[9999px] top-auto h-px w-px overflow-hidden opacity-0"
          >
            <label htmlFor="tm-website">Website</label>
            <input
              id="tm-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-ink-900">
                {t.formTitle}
              </h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {t.formHint}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t.cancel}
              className="grid size-9 shrink-0 place-items-center rounded-full bg-sand-100 text-slate-500 transition hover:bg-slate-200"
            >
              <X className="size-4" />
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-200">
              {error}
            </div>
          )}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="tm-name">
                {t.name}
              </label>
              <input
                id="tm-name"
                name="name"
                required
                autoComplete="name"
                maxLength={60}
                placeholder={t.namePlaceholder}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="tm-role">
                {t.role}
              </label>
              <input
                id="tm-role"
                name="role"
                maxLength={60}
                placeholder={t.rolePlaceholder}
                className={inputCls}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className={labelCls} htmlFor="tm-text">
              {t.text}
            </label>
            <textarea
              id="tm-text"
              name="text"
              required
              rows={4}
              maxLength={500}
              placeholder={t.textPlaceholder}
              className={inputCls}
            />
          </div>

          {siteKey && <TurnstileWidget siteKey={siteKey} theme="light" />}

          <p className="mt-3 text-xs font-semibold text-slate-400">
            {t.privacyNote}
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={pending}
              className="btn-brand inline-flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-extrabold text-white transition hover:brightness-105 disabled:opacity-60"
            >
              <Send className="size-4" />
              {pending ? t.submitting : t.submit}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-extrabold text-ink-900 transition hover:border-slate-300"
            >
              {t.cancel}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export function Testimonials({
  items,
  locale,
  title,
  subtitle,
  t,
  siteKey,
}: {
  items: Testimonial[]
  locale: Locale
  title: string
  subtitle: string
  t: Dictionary["testimonials"]
  siteKey: string
}) {
  const [index, setIndex] = useState(0)
  const isRtl = locale === "ar"

  const next = useCallback(
    () =>
      setIndex((i) => (items.length > 1 ? (i + 1) % items.length : 0)),
    [items.length],
  )
  const prev = () =>
    setIndex((i) =>
      items.length > 1 ? (i - 1 + items.length) % items.length : 0,
    )

  useEffect(() => {
    if (items.length < 2) return
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next, items.length])

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft
  const NextIcon = isRtl ? ChevronLeft : ChevronRight
  const item = items[index]

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-brand-700 ring-1 ring-brand-100">
            <Star className="size-3.5 fill-gold-500 text-gold-500" />
            4.9
          </span>
          <h2 className="mt-4 text-2xl font-black text-ink-900 sm:text-3xl">
            {title}
          </h2>
          <p className="mt-2 text-sm text-slate-50 sm:text-base">
            {subtitle}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="mx-auto mt-10 max-w-3xl rounded-[2rem] bg-white p-10 text-center shadow-soft ring-1 ring-slate-200/70">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <Quote className="size-7" />
            </span>
            <h3 className="mt-4 text-lg font-black text-ink-900">
              {t.empty}
            </h3>
            <p className="mt-1.5 text-sm font-semibold text-slate-400">
              {t.emptyDesc}
            </p>
          </div>
        ) : (
          <div className="relative mx-auto mt-10 max-w-3xl">
            <div className="relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-soft ring-1 ring-slate-200/70 sm:p-12">
              <span className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-gold-400 to-brand-500" />
              <span className="pointer-events-none absolute -end-16 -top-16 size-44 rounded-full bg-gold-400/10 blur-2xl" />
              <span className="relative grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-800 text-white shadow-lg shadow-brand-800/25">
                <Quote className="size-6 rtl:-scale-x-100" />
              </span>
              <blockquote className="mt-6 text-lg font-semibold leading-9 text-ink-900 sm:text-xl">
                “{item.quote}”
              </blockquote>
              <div className="mt-7 flex items-center gap-4 border-t border-slate-100 pt-6">
                <span className="grid size-12 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-black text-white">
                  {item.name.charAt(0)}
                </span>
                <div>
                  <p className="font-extrabold text-ink-900">{item.name}</p>
                  <p className="text-sm font-semibold text-slate-500">
                    {item.role}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous testimonial"
                className="grid size-10 place-items-center rounded-full bg-white text-ink-900 ring-1 ring-slate-200 transition hover:bg-brand-600 hover:text-white"
              >
                <PrevIcon className="size-5" />
              </button>
              <div className="flex items-center gap-2">
                {items.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Testimonial ${i + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === index ? "w-8 bg-brand-600" : "w-2 bg-slate-300"
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={next}
                aria-label="Next testimonial"
                className="grid size-10 place-items-center rounded-full bg-white text-ink-900 ring-1 ring-slate-200 transition hover:bg-brand-600 hover:text-white"
              >
                <NextIcon className="size-5" />
              </button>
            </div>
          </div>
        )}

        <TestimonialForm t={t} siteKey={siteKey} />
      </div>
    </section>
  )
}
