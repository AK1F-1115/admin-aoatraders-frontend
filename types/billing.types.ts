/**
 * Billing plan types for the AOA Admin.
 * Matches GET /billing/plans response contract.
 */
export interface BillingPlan {
  id: number
  slug: string
  name: string
  price_usd: number
  sku_limit: number | null
  trial_days: number
}
