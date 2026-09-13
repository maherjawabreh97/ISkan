"use client"

import Script from "next/script"

const MEASUREMENT_IDS = ["G-G8H7V5Q24S"]

export function Analytics() {
  const gtagScript = MEASUREMENT_IDS.map((id) => `gtag('config', '${id}');`).join(" ")

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_IDS[0]}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive" dangerouslySetInnerHTML={{
        __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());${gtagScript}`
      }} />
    </>
  )
}