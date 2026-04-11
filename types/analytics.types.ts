/**
 * Analytics types for the AOA Admin dashboard.
 * Matches the GET /admin/analytics/* response contracts (spec §15).
 */

export interface OrdersByStatus {
  pending_purchase: number
  purchased: number
  fulfillment_sent: number
  shipped: number
  delivered: number
  cancelled: number
  no_aoa_items: number
}

export interface AnalyticsSummary {
  period_start: string
  period_end: string
  total_orders: number
  total_merchant_revenue: number
  /** Always null in current backend implementation */
  total_aoa_cost: null
  /** Always null in current backend implementation */
  total_aoa_margin: null
  /** Always null in current backend implementation */
  avg_margin_pct: null
  orders_by_status: OrdersByStatus
  active_stores: number
  mrr_shopify_billing: number
}

export interface StoreAnalytics {
  store_id: number
  shop_domain: string
  plan: string | null
  orders_count: number
  total_merchant_revenue: number
  /** Always null — supplier cost not tracked yet */
  margin: null
  /** Always null — supplier cost not tracked yet */
  margin_pct: null
  active_products: number
}

export interface OrdersOverTimeSeries {
  date: string
  orders: number
  revenue: number
}

export interface OrdersOverTime {
  granularity: 'day' | 'week' | 'month'
  series: OrdersOverTimeSeries[]
}

export interface TopProduct {
  aoa_sku: string | null
  title: string | null
  supplier: string | null
  orders_count: number
  total_merchant_revenue: number
  /** Always null — supplier cost not tracked yet */
  avg_margin_pct: null
}
