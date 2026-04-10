/**
 * Order domain types for the AOA Admin.
 * Matches GET /admin/orders response contract (spec §5.4, §15).
 */
export type { OrderStatus } from './api.types'

export interface OrderStore {
  id: number
  shop_domain: string
}

export interface Order {
  id: number
  shopify_order_id: string | null
  store: OrderStore | null
  customer_name: string | null
  status: import('./api.types').OrderStatus
  total_merchant_cost: number | null
  total_aoa_cost: number | null
  item_count: number
  created_at: string
}
