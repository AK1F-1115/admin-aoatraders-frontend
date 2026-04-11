/**
 * Order domain types for the AOA Admin.
 * Confirmed against live API response contracts (ADMIN_FRONTEND.md §17).
 *
 * Key notes:
 * - GET /admin/orders returns { orders: OrderListItem[], total, page, per_page, pages }
 * - GET /admin/orders/{id} returns OrderDetail with line items under `items` key
 * - All monetary fields are Decimal-as-string — always parseFloat() before arithmetic
 */
export type { OrderStatus } from './api.types'

/** List item from GET /admin/orders */
export interface Order {
  id: number
  shopify_order_id: string | null
  shopify_order_number: string | null      // human-readable e.g. "#1042"
  customer_email: string | null
  customer_name: string | null
  subtotal_price: string | null            // what merchant's customer paid (Shopify)
  aoa_total_cost: string | null            // what AOA charges the merchant
  shipping_cost: string | null             // null until EDI 810 fills it
  status: import('./api.types').OrderStatus
  tracking_number: string | null
  ordered_at: string | null
  purchased_at: string | null
  created_at: string
  // ── Fields that require backend to include in list response ─────────────
  /** Store shop domain, e.g. "my-store.myshopify.com" */
  store_name: string | null
  /** First line item product display name (single-item orders) */
  first_item_product_name: string | null
  /** First line item AOA SKU */
  first_item_aoa_sku: string | null
  /** First line item Supplier SKU */
  first_item_supplier_sku: string | null
  /** Total number of distinct line items */
  item_count: number | null
}

export interface ShippingAddress {
  first_name: string | null
  last_name: string | null
  address1: string | null
  address2: string | null
  city: string | null
  province: string | null
  province_code: string | null
  country: string | null
  country_code: string | null
  zip: string | null
  phone: string | null
}

/** Line item from GET /admin/orders/{id} — under the `items` key */
export interface OrderItem {
  id: number
  shopify_line_item_id: string | null
  shopify_variant_id: string | null
  aoa_sku: string | null
  supplier_sku: string | null
  supplier: 'essendant' | 'essendant_vds' | string | null
  product_name: string | null              // display name
  quantity: number
  shopify_price: string | null             // per-unit — what merchant's customer paid
  merchant_cost: string | null             // per-unit — what AOA charges the merchant
  line_total_cost: string | null           // merchant_cost × quantity (pre-computed)
  variant_tier: number | null              // 1 = normal, 2 = VDS qty-break
}

/** Full order from GET /admin/orders/{id} */
export interface OrderDetail extends Order {
  store_id: number
  stripe_payment_intent_id: string | null
  stripe_payment_status: 'succeeded' | 'failed' | 'requires_action' | 'canceled' | 'refunded' | string | null
  shipping_address_json: ShippingAddress | null
  fulfilled_at: string | null
  updated_at: string
  items: OrderItem[]                       // note: `items`, not `line_items`
  /** Number of failed auto-charge attempts (0 = none) */
  charge_attempts: number
  /** Last Stripe decline message, if any */
  charge_failure_reason: string | null
  /** True if a chargeback has been filed */
  is_disputed: boolean
  /** Stripe dispute ID (dp_...) */
  dispute_id: string | null
  /** Stripe dispute reason (e.g. 'fraudulent') */
  dispute_reason: string | null
}

/** Response from PATCH /admin/orders/{id}/status */
export interface UpdateOrderStatusResponse {
  order_id: number
  status: import('./api.types').OrderStatus
  tracking_number: string | null
  refund_issued: boolean
  refund_id: string | null
  message: string
}
