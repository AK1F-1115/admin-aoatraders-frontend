/**
 * AOA internal price plan tiers.
 * Matches GET /admin/price-plans response contract.
 *
 * Markup fields are stored as decimals (0.35 = 35%).
 * Display them multiplied by 100; divide by 100 before submitting a PATCH.
 */
export interface PricePlan {
  id: number
  name: string
  /** Decimal — 0.35 = 35% */
  markup_retail: number
  /** Decimal — 0.35 = 35% */
  markup_vds: number
  /** Decimal — 0.35 = 35% */
  markup_wholesale: number
  /** Number of stores currently on this plan tier */
  store_count: number
}

/**
 * PATCH /admin/price-plans/{id} request body.
 * Send only the fields you want to change.
 */
export interface UpdatePricePlanBody {
  markup_retail?: number
  markup_vds?: number
  markup_wholesale?: number
}
