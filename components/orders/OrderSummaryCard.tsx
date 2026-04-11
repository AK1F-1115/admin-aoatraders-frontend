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

  const hasChargeFailed = (order.charge_attempts ?? 0) > 0 && order.status === 'pending_purchase'
  const isDisputed = order.is_disputed === true

  // Stripe payment intent status label/color
  const piStatus = order.stripe_payment_status
  const piStatusLabel: Record<string, { label: string; cls: string }> = {
    succeeded: { label: 'Succeeded', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    failed: { label: 'Failed', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    requires_action: { label: 'Requires Action', cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    canceled: { label: 'Canceled', cls: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400' },
    refunded: { label: 'Refunded', cls: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400' },
  }
  const piDisplay = piStatus ? (piStatusLabel[piStatus] ?? { label: piStatus, cls: 'bg-muted text-muted-foreground' }) : null

  return (
    <div className="rounded-lg border bg-card p-5 space-y-4">
      <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Order Summary</h2>

      {/* Dispute banner */}
      {isDisputed && (
        <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-3 dark:border-red-700 dark:bg-red-950/40">
          <span className="text-base">🚨</span>
          <div className="text-sm text-red-700 dark:text-red-400">
            <span className="font-semibold">DISPUTED</span> — Chargeback filed
            {order.dispute_reason && <span className="ml-1">(reason: <span className="font-medium">{order.dispute_reason}</span>)</span>}
            {order.dispute_id && <span className="ml-1 font-mono text-xs opacity-75">· {order.dispute_id}</span>}
          </div>
        </div>
      )}

      {/* Charge failure banner */}
      {hasChargeFailed && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-700 dark:bg-amber-950/40">
          <span className="text-base">⚠️</span>
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Auto-charge failed{' '}
            <span className="font-semibold">{order.charge_attempts}×</span>
            {order.charge_failure_reason && (
              <> — &ldquo;{order.charge_failure_reason}&rdquo;</>
            )}
          </p>
        </div>
      )}

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
            <div className="flex items-center gap-2">
              <p className="font-mono text-xs break-all">{order.stripe_payment_intent_id}</p>
              {piDisplay && (
                <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${piDisplay.cls}`}>
                  {piDisplay.label}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
