/**
 * Transactional email through Resend's HTTPS API.
 *
 * A Worker cannot open a raw SMTP connection — outbound TCP is limited to
 * HTTPS on port 443 — so an HTTPS relay is the only option from this runtime.
 * Resend is a pure JSON API, which fits a Worker better than SMTP would.
 *
 * The API key is a Worker secret (`wrangler secret put RESEND_API_KEY`); it is
 * never exposed to the browser and never written to disk.
 *
 * Every function returns a boolean instead of throwing. Email is a courtesy,
 * not a gate: if the key is missing, the sending domain is not verified yet,
 * or the provider is down, the caller falls back to showing the code on screen
 * rather than stranding the user.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails"

/**
 * Where codes appear to come from.
 *
 * Format is `Display Name <address>`, so the site name and domain can both
 * show up in the recipient's inbox: "Iskan Real Estate | iskantr.com
 * <noreply@iskantr.com>".
 *
 * `onboarding@resend.dev` works immediately but only delivers to the Resend
 * account owner, so it is only useful for testing.
 */
function sender(): string {
  return (
    process.env.RESEND_FROM?.trim() ||
    "Iskan Real Estate | iskantr.com <onboarding@resend.dev>"
  )
}

/**
 * Replies go to the real inbox. The sending address is a no-reply one, so
 * without this a reply would simply bounce.
 */
function replyTo(): string | undefined {
  const value = process.env.RESEND_REPLY_TO?.trim()
  if (!value) return undefined
  // Reject anything that is not a plain address, so a misconfigured variable
  // can never reshape the header.
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value) ? value : undefined
}

async function post(payload: Record<string, unknown>): Promise<boolean> {
  const key = process.env.RESEND_API_KEY?.trim()
  if (!key) {
    console.warn("[email] RESEND_API_KEY is not set; skipping send.")
    return false
  }

  const reply = replyTo()
  const body = reply ? { ...payload, reply_to: reply } : payload

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => "")
      console.error(
        `[email] send failed (${response.status}): ${detail.slice(0, 300)}`,
      )
      return false
    }
    return true
  } catch (error) {
    console.error("[email] send threw:", error)
    return false
  }
}

/**
 * Inline styles only: most mail clients strip <style> blocks, and the site's
 * CSP would block a remote stylesheet anyway.
 */
function layout(input: {
  title: string
  body: string
  headline?: string
  footer: string
}): string {
  return `<!doctype html>
<html lang="ar" dir="rtl">
  <body style="margin:0;padding:24px;background:#f5f3ef;font-family:system-ui,-apple-system,'Segoe UI',Tahoma,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <tr>
        <td style="background:#0b1220;padding:24px;text-align:center;">
          <p style="margin:0;color:#f0b429;font-size:13px;font-weight:700;letter-spacing:.18em;">ISKAN</p>
          <h1 style="margin:8px 0 0;color:#ffffff;font-size:20px;font-weight:800;">${input.title}</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 24px;text-align:center;">
          <p style="margin:0 0 20px;font-size:15px;line-height:1.9;">${input.body}</p>
          ${
            input.headline
              ? `<p style="margin:0;font-size:40px;font-weight:800;letter-spacing:.35em;color:#0f172a;">${input.headline}</p>`
              : ""
          }
        </td>
      </tr>
      <tr>
        <td style="padding:18px 24px;background:#faf9f7;text-align:center;">
          <p style="margin:0;font-size:12px;line-height:1.8;color:#6b7280;">${input.footer}</p>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

/** The one-time account confirmation code. */
export async function sendVerificationEmail(input: {
  to: string
  code: string
  locale: "ar" | "en"
}): Promise<boolean> {
  const ar = input.locale === "ar"
  return post({
    from: sender(),
    to: [input.to],
    subject: ar
      ? `${input.code} — كود تأكيد حسابك في إسكان`
      : `${input.code} — your Iskan confirmation code`,
    html: layout({
      title: ar ? "كود تأكيد الحساب" : "Your account confirmation code",
      body: ar
        ? "استخدم هذا الكود لتأكيد حسابك في إسكان. ينتهي صلاحيته خلال ١٥ دقيقة."
        : "Use this code to confirm your Iskan account. It expires in 15 minutes.",
      headline: input.code,
      footer: ar
        ? "لم تطلب هذا الكود؟ تجاهل هذه الرسالة."
        : "If you did not request this code you can safely ignore this email.",
    }),
  })
}