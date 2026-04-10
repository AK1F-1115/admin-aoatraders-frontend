'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { OrderDetail } from '@/types/order.types'
import StatusBadge from '@/components/common/StatusBadge'
import { formatRelativeTime } from '@/lib/utils'
import OrderSummaryCard from './OrderSummaryCard'
import OrderLineItemsTable from './OrderLineItemsTable'
import OrderStatusPanel from './OrderStatusPanel'

interface OrderDetailClientProps {
  order: OrderDetail
}

/**
 * Client wrapper for the Order Detail page.
 * Two-column layout: main content (summary + line items) and right sidebar (status panel).
 */
export default function OrderDetailClient({ order }: OrderDetailClientProps) {
  const [currentOrder, setCurrentOrder] = useState(order)

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      {/* Back link + header */}
      <div className="space-y-1">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {currentOrder.shopify_order_number
              ? `Order ${currentOrder.shopify_order_number}`
              : `Order #${currentOrder.id}`}
          </h1>
          <StatusBadge status={currentOrder.status} />
          <span className="text-sm text-muted-foreground">
            {formatRelativeTime(currentOrder.created_at)}
          </span>
        </div>
        {currentOrder.store && (
          <p className="text-sm text-muted-foreground">
            {currentOrder.store.shop_domain}
          </p>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: summary + line items */}
        <div className="space-y-6 lg:col-span-2">
          <OrderSummaryCard order={currentOrder} />
          <OrderLineItemsTable lineItems={currentOrder.line_items} />
        </div>

        {/* Right: status panel */}
        <div>
          <OrderStatusPanel order={currentOrder} onStatusChange={setCurrentOrder} />
        </div>
      </div>
    </div>
  )
}
