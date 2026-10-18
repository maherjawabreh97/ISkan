import { getSupabase, hasSupabase } from "./supabase"

/**
 * Account confirmation through Supabase Auth.
 *
 * Supabase sends and checks the one-time code for us, so we do not have to run
 * our own mail path. The advertiser's profile, password hash and listing
 * ownership stay in D1 — Supabase is only the delivery and verification layer,
 * so this does not weaken the separation between public accounts and the admin
 * users table.
 *
 * Two limits worth knowing:
 *  - Phone numbers are not covered. `signInWithOtp` needs an email address, so
 *    a phone-only registration falls back to the on-screen code.
 *  - Supabase's built-in mailer is rate limited (a handful of messages an hour,
 *    and only to project members) until a custom SMTP provider is added under
 *    Project Settings -> Authentication -> SMTP.
 *
 * Both cases return false rather than throwing, and the caller falls back to
 * showing the code so a user is never stranded.
 */

export type OtpDelivery = "supabase" | "manual"

export async function sendOtp(email: string): Promise<boolean> {
  if (!hasSupabase()) {
    console.warn("[otp] Supabase is not configured.")
    return false
  }

  try {
    const { error } = await getSupabase().auth.signInWithOtp({
      email,
      options: {
        // `true` is required: with `false` Supabase refuses to send to an
        // address it has never seen, which is every new registration. Creating
        // the auth row is harmless — access is still decided by the account in
        // D1, and a code only ever activates an account that already exists
        // there with that same email.
        shouldCreateUser: true,
      },
    })
    if (error) {
      console.error("[otp] signInWithOtp failed:", error.message)
      return false
    }
    return true
  } catch (error) {
    console.error("[otp] signInWithOtp threw:", error)
    return false
  }
}

/**
 * Checks a code against Supabase. Returns true only when Supabase confirms it;
 * a false result just means "fall back to our own check".
 */
export async function verifyOtp(email: string, token: string): Promise<boolean> {
  if (!hasSupabase()) return false

  try {
    const { error } = await getSupabase().auth.verifyOtp({
      email,
      token,
      type: "email",
    })
    if (error) {
      console.warn("[otp] verifyOtp rejected:", error.message)
      return false
    }
    return true
  } catch (error) {
    console.error("[otp] verifyOtp threw:", error)
    return false
  }
}

/** How a code should be checked, so the UI can say the right thing. */
export function deliveryFor(email: string | undefined): OtpDelivery {
  return email ? "supabase" : "manual"
}