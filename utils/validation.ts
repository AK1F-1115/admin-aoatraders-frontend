import { z } from 'zod'

/**
 * Base Zod schemas used across multiple forms.
 * Form-specific schemas are co-located with their form components.
 */

/** Non-empty string with whitespace trimmed */
export const requiredString = z.string().min(1, 'This field is required').trim()

/** Decimal markup — stored as 0–1, input as 0–100 % */
export const markupPercentSchema = z
  .number()
  .min(0, 'Must be ≥ 0')
  .max(200, 'Must be ≤ 200')

/** Positive integer */
export const positiveInt = z
  .number()
  .int('Must be a whole number')
  .positive('Must be greater than 0')

/** Optional URL — empty string treated as undefined */
export const optionalUrl = z
  .string()
  .url('Must be a valid URL')
  .or(z.literal(''))
  .optional()
  .transform((v) => (v === '' ? undefined : v))
