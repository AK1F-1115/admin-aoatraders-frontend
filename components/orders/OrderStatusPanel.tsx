'use client'

import { useState, useTransition } from 'react'
import toast from 'react-hot-toast'
import { formatMoney } from '@/lib/utils'
import type { OrderDetail } from '@/types/order.types'
import type { OrderStatus } from '@/types/api.types'
import { updateOrderStatus } from '@/lib/actions/order'
import StatusBadge from '@/components/common/StatusBadge'
import ConfirmModal from '@/components/common/ConfirmModal'

interface OrderStatusPanelProps {
  order: OrderDetail
  onStatusChange: (updated: OrderDetail) => void
}

export default function OrderStatusPanel({ order, onStatusChange }: OrderStatusPanelProps) {
  const [isPending, startTransition] = useTransition()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [error, setError] = useState<string | null>(null)

  const transition = (status: OrderStatus, tracking?: string) => {
    setError(null)
    startTransition(async () => {
      try {
        const result = await updateOrderStatus(order.id, status, tracking)
        onStatusChange({ ...order, status: result.status, tracking_number: result.tracking_number })
        if (result.refund_issued) {
          toast.success(`Order cancelled. Refund ${result.refund_id} issued.`)
        } else if (result.status === 'cancelled') {
          result.message.includes('Warning') ? toast.error(result.message) : toast.success(result.message)
        } else {
          toast.success(result.message)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    })
  }

  const { status } = order
  const hasCharge = status === 'purchased' && !!order.stripe_payment_intent_id
  const refundAmount = order.aoa_total_cost ? formatMoney(parseFloat(order.aoa_total_cost)) : null
  const cancelDescription = hasCharge && refundAmount
    ? `This will issue a full Stripe refund of ${refundAmount} to the merchant. This cannot be undone.`
    : 'Order will be cancelled. No Stripe payment found to refund.'

  return (
    <div className="rounded-lg border bg-card p-5 space-y-4 sticky top-6">
      <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Status</h2>
      <StatusBadge status={status} />

      {error && (
        <p className="rounded bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
      )}

      {status === 'purchased' && (
        <div className="space-y-2 pt-2">
          <button onClick={() => transition('fulfillment_sent')} disabled={isPending}
            className="w-full rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
            {isPending ? 'Saving…' : 'Mark as Fulfillment Sent'}
          </button>
          <button onClick={() => setCancelOpen(true)} disabled={isPending}
            className="w-full rounded border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50">
            Cancel Order
          </button>
        </div>
      )}

      {status === 'fulfillment_sent' && (
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-medium text-muted-foreground">
            Tracking Number <span className="text-destructive">*</span>
          </label>
          <input type="text" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="e.g. 1Z999AA10123456784"
            className="w-full rounded border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <button
            onClick={() => { if (!trackingNumber.trim()) { setError('Tracking number is required'); return } transition('shipped', trackingNumber.trim()) }}
            disabled={isPending}
            className="w-full rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
            {isPending ? 'Saving…' : 'Mark as Shipped'}
          </button>
        </div>
      )}

      {status === 'shipped' && (
        <div className="pt-2">
          <button onClick={() => transition('delivered')} disabled={isPending}
            className="w-full rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
            {isPending ? 'Saving…' : 'Mark as Delivered'}
          </button>
        </div>
      )}

      {(status === 'pending_purchase' || status === 'delivered' || status === 'cancelled' || status === 'no_aoa_items') && (
        <p className="text-xs text-muted-foreground pt-1">
          {status === 'pending_purchase' && 'Waiting for merchant to complete purchase.'}
          {status === 'delivered' && 'Order has been delivered.'}
          {status === 'cancelled' && 'Order has been cancelled.'}
          {status === 'no_aoa_items' && 'No AOA line items — no action needed.'}
        </p>
      )}

      <ConfirmModal
        open={cancelOpen}
        title={`Cancel Order ${order.shopify_order_number ?? `#${order.id}`}?`}
        description={cancelDescription}
        confirmText="Cancel Order"
        onConfirm={() => { setCancelOpen(false); transition('cancelled') }}
        onClose={() => setCancelOpen(false)}
        loading={isPending}
      />
    </div>
  )
}
