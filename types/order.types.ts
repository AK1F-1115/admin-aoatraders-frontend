/**
 * Order domain types for the AOA Admin.
 * Matches actual GET /admin/orders response (confirmed from live API).
 *
 * Key notes:
 * - No `store` object returned by the list endpoint
 * - Monetary fields are decimal strings e.g. "39.9700"
 * - Use parseFloat() before passing to formatCurrency()
 */
export type { OrderStatus } from './api.types'

export interface Order {
  id: number
  shopify_order_id: string | null
  shopify_order_number: string | null
  customer_email: string | null
  customer_name: string | null
  subtotal_price: string | null     // what merchant pays AOA — always populated
  aoa_total_cost: string | null     // AOA cost — may be null
  shipping_cost: string | null
  status: import('./api.types').OrderStatus
  tracking_number: string | null
  ordered_at: string | null
  purchased_at: string | null
  created_at: string
}
