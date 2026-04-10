/**
 * Store domain types for the AOA Admin.
 * Matches GET /admin/stores and GET /admin/stores/{id} response contract.
 * Updated for backend commit 97855ec — flat subscription fields, untyped sync_config.
 */

export interface Store {
  id: number
  shop_domain: string
  location_id: string | null
  active: boolean

  // Price plan (AOA internal markup tiers)
  price_plan_id: number | null
  price_plan_name: string | null

  // AOA markup percentages (decimal, e.g. 0.15 = 15%)
  aoa_markup_pct_retail: number | null
  aoa_markup_pct_vds: number | null
  aoa_markup_pct_wholesale: number | null

  // Merchant markup percentages (decimal, e.g. 0.10 = 10%)
  merchant_markup_pct_retail: number
  merchant_markup_pct_vds: number
  merchant_markup_pct_wholesale: number

  collection_map: Record<string, string> | null

  /** Per-store sync configuration. Untyped — access via string keys. */
  sync_config: Record<string, unknown> | null

  installed_at: string | null
  last_sync_at: string | null

  // Subscription / billing (flat fields — no nested object)
  subscription_plan_id: number | null
  subscription_plan_name: string | null
  subscription_plan_slug: string | null
  subscription_status: string | null
  trial_ends_at: string | null

  // Onboarding / feature flags (top-level)
  collections_bootstrapped: boolean
  auto_shipping_profiles: boolean
  shipping_profiles_bootstrapped: boolean
  onboarding_dismissed: boolean
  use_auto_pricing: boolean

  // Computed
  active_product_count: number
}
// ── Catalog summary types (GET /admin/stores/{id}/catalog-summary) ───────────────────

export interface CatalogCategory {
  name: string
  count: number
}

export interface StoreCatalogSummary {
  store_id: number
  shop_domain: string
  plan_name: string | null
  plan_slug: string | null
  // Slot accounting
  slots_used: number
  slots_total: number | null        // null = Pro (unlimited)
  slots_remaining: number | null    // null = unlimited
  // Product counts
  total_active_variants: number
  unique_product_count: number
  retail_count: number
  vds_count: number
  vds_tier2_count: number
  // Shopify push status
  shopify_pushed_count: number
  shopify_unpushed_count: number
  last_sync_at: string | null
  categories: CatalogCategory[]
  brands: CatalogCategory[]
}
// ── Webhook types (GET /admin/stores/{id}/webhooks) ──────────────────────────

export interface StoreWebhook {
  id: number
  topic: string
  address: string
  format: string | null
  created_at: string | null
  updated_at: string | null
}

export interface StoreWebhooksResponse {
  store_id: number
  shop_domain: string
  count: number
  webhooks: StoreWebhook[]
}

export interface RegisterWebhooksResponse {
  store_id: number
  shop_domain: string
  registered: string[]
  skipped: string[]
  errors: string[]
  ok: boolean
}
