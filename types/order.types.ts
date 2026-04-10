/**
 * Order domain types for the AOA Admin.
 * Matches actual GET /admin/orders response (confirmed from live API).
 *
 * Key notes:
 * - No `store` object returned by the list endpoint
 * - Monetary fields are decimal strings e.g. "39.9700"
 * - Use parseFloat() before passing to formatMoney()
 */
export type { OrderStatus } from './api.types'

export interface Order {
  id: number
  store_id?: number | null
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

export interface ShippingAddress {
  first_name?: string
  last_name?: string
  address1?: string
  address2?: string
  city?: string
  province?: string
  zip?: string
  country?: string
  phone?: string
}

export interface OrderLineItem {
  id: number
  aoa_sku: string | null
  title: string
  supplier: string | null
  quantity: number
  unit_aoa_cost: string | null       // decimal string
  unit_merchant_cost: string | null  // decimal string
}

/** Full order response from GET /admin/orders/{id} — includes store, line items, payment info */
export interface OrderDetail extends Order {
  store: { id: number; shop_domain: string } | null
  stripe_payment_intent_id: string | null
  shipping_address_json: ShippingAddress | null
  line_items: OrderLineItem[]
}

export interface StatusUpdateRequest {
  status: import('./api.types').OrderStatus
  tracking_number?: string
}
