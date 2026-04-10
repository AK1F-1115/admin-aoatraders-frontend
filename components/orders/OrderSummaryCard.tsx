import type { OrderDetail } from '@/types/order.types'

interface OrderSummaryCardProps {
  order: OrderDetail
  shopDomain: string | null
}

export default function OrderSummaryCard({ order, shopDomain }: OrderSummaryCardProps) {
  const addr = order.shipping_address_json
  const shopifyAdminUrl = shopDomain && order.shopify_order_id
    ? `https://${shopDomain}/admin/orders/${order.shopify_order_id}`
    : null

  return (
    <div className="rounded-lg border bg-card p-5 space-y-4">
      <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Order Summary</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Customer</p>
          <p className="font-medium">{order.customer_name ?? order.customer_email ?? '—'}</p>
          {order.customer_email && order.customer_name && (
            <p className="text-sm text-muted-foreground">{order.customer_email}</p>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Shipping Address</p>
          {addr ? (
            <address className="not-italic text-sm leading-relaxed">
              {addr.first_name} {addr.last_name}<br />
              {addr.address1}<br />
              {addr.city}, {addr.province_code ?? addr.province} {addr.zip}<br />
              {addr.country_code ?? addr.country}
              {addr.phone && <><br />{addr.phone}</>}
            </address>
          ) : (
            <p className="text-sm text-muted-foreground">No address on file</p>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Shopify Order</p>
          {shopifyAdminUrl ? (
            <a href={shopifyAdminUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
              {order.shopify_order_number ?? order.shopify_order_id ?? '—'}
            </a>
          ) : (
            <p className="text-sm">{order.shopify_order_number ?? order.shopify_order_id ?? '—'}</p>
          )}
        </div>

        {order.stripe_payment_intent_id && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Stripe Payment Intent</p>
            <p className="font-mono text-xs break-all">{order.stripe_payment_intent_id}</p>
          </div>
        )}
      </div>
    </div>
  )
}
