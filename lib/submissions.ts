import type { CityKey, PropertyTypeKey, PurposeKey } from "./dictionaries/types"
import type { CurrencyKey } from "./format"

export type SubmissionStatus = "pending" | "approved" | "rejected"

/**
 * A listing submitted by a visitor from the public "list your property" form.
 * Submissions are never shown publicly until an admin approves them.
 */
export interface SubmissionInput {
  contactName: string
  phone: string
  email?: string
  title: string
  purpose: PurposeKey
  type: PropertyTypeKey
  city: CityKey
  price: number
  currency: CurrencyKey
  pricePerMonth: boolean
  area: number
  bedrooms: number
  bathrooms: number
  floor?: number
  furnished: boolean
  address: string
  description: string
  images: string[]
}

export interface Submission extends SubmissionInput {
  id: string
  status: SubmissionStatus
  createdAt: number
  updatedAt: number
  reviewedAt?: number
  /** Slug of the property created when the submission was approved. */
  reviewedSlug?: string
  ip: string
  userAgent: string
}
