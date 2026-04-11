/**
 * AOA internal price plan tiers.
 * Matches GET /admin/price-plans response contract (a578d81).
 *
 * Markup fields are stored as decimals (0.35 = 35%).
 * Display them multiplied by 100; divide by 100 before submitting.
 */
export interface PricePlan {
  id: number
  name: string
  /** Decimal — 0.35 = 35% */
  aoa_markup_pct_retail: number
  /** Decimal — 0.35 = 35% */
  aoa_markup_pct_vds: number
  /** Decimal — 0.35 = 35% */
  aoa_markup_pct_wholesale: number
  description: string | null
  active: boolean
  /** Count of active stores currently on this plan */
  store_count: number
  created_at: string
}

/**
 * POST /admin/price-plans request body.
 */
export interface CreatePricePlanBody {
  name: string
  description?: string | null
  aoa_markup_pct_retail: number
  aoa_markup_pct_vds: number
  aoa_markup_pct_wholesale: number
}

/**
 * PATCH /admin/price-plans/{id} request body.
 * Send only the fields you want to change.
 */
export interface UpdatePricePlanBody {
  name?: string
  description?: string | null
  aoa_markup_pct_retail?: number
  aoa_markup_pct_vds?: number
  aoa_markup_pct_wholesale?: number
  active?: boolean
}
