/**
 * Billing plan types for the AOA Admin.
 * Matches GET /billing/plans response contract.
 */
export interface BillingPlan {
  id: number
  slug: string
  name: string
  price_usd: number | string   // API returns string; always coerce via Number()
  sku_limit: number | null
  trial_days: number
}

/**
 * Row shape used in the Store Billing table.
 * Derived from Store — only the fields the billing page cares about.
 */
export interface StoreBillingRow {
  id: number
  shop_domain: string
  active: boolean
  subscription_plan_id: number | null
  subscription_plan_slug: string | null
  subscription_plan_name: string | null
  subscription_status: string | null
}

/**
 * Computed KPI stats derived from the stores list.
 * Calculated client-side — not from a dedicated API endpoint.
 */
export interface BillingKpiStats {
  totalActiveStores: number
  mrr: number          // sum of price_usd for active paid stores
  freeTierCount: number
  paidTierCount: number
}
