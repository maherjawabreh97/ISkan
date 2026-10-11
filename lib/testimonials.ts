/**
 * Visitor-submitted testimonials ("what our clients say").
 *
 * Testimonials sit in a moderation queue (see lib/testimonials-store.ts)
 * and only appear on the public site after an admin approves them from
 * the dashboard.
 */

export type TestimonialStatus = "pending" | "approved"

export interface TestimonialInput {
  name: string
  /** Optional context shown under the name, e.g. city or occupation. */
  role: string
  text: string
}

export interface Testimonial extends TestimonialInput {
  id: string
  status: TestimonialStatus
  createdAt: number
  updatedAt: number
  ip: string
}
