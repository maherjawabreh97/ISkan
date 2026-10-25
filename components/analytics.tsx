const MEASUREMENT_IDS = ["G-8YG8BYG8CJ"]

/**
 * Google Analytics, loaded without a third-party inline script.
 *
 * The bootstrap is the one inline `<script>` on the page, so it carries the
 * per-request CSP nonce — an injected script without that nonce cannot run.
 */
export function Analytics({ nonce }: { nonce?: string }) {
  const gtagScript = MEASUREMENT_IDS.map((id) => `gtag('config', '${id}');`).join(" ")

  return (
    <>
      {MEASUREMENT_IDS.map((id) => (
        <script
          key={id}
          async
          nonce={nonce}
          src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        />
      ))}
      <script
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());${gtagScript}`,
        }}
      />
    </>
  )
}
