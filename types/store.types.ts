/**
 * Store domain types for the AOA Admin.
 * Matches GET /admin/stores response contract.
 */
import type { StoreStatus } from './api.types'

export type { StoreStatus }

export interface SyncConfig {
  push_retail: boolean
  push_vds: boolean
  max_retail: number | null
  max_vds: number | null
  retail_categories: string[]
  excluded_categories: string[]
  retail_brands: string[]
  excluded_brands: string[]
  bootstrap_brands: boolean
  min_brand_products: number
  auto_shipping_profiles: boolean
  use_auto_pricing: boolean
}

export interface SubscriptionPlan {
  id: number
  slug: string
  name: string
  price_usd: number
  sku_limit: number | null
  trial_days: number
}

export interface Store {
  id: number
  shop_domain: string
  active: boolean
  subscription_status: StoreStatus
  subscription_plan: SubscriptionPlan | null
  sync_config: SyncConfig
  location_id: string | null
  collections_bootstrapped: boolean
  shipping_profiles_bootstrapped: boolean
  installed_at: string
  last_sync_at: string | null
  active_product_count: number
  merchant_markup_pct_retail: number
  merchant_markup_pct_vds: number
  merchant_markup_pct_wholesale: number
}
