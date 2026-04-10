'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { clientApiRequest } from '@/lib/clientApi'
import type { OrderDetail } from '@/types/order.types'
import type { Store } from '@/types/store.types'
import StatusBadge from '@/components/common/StatusBadge'
import { formatRelativeTime } from '@/lib/utils'
import OrderSummaryCard from './OrderSummaryCard'
import OrderLineItemsTable from './OrderLineItemsTable'
import OrderStatusPanel from './OrderStatusPanel'

interface OrderDetailClientProps {
  order: OrderDetail
}

export default function OrderDetailClient({ order }: OrderDetailClientProps) {
  const [currentOrder, setCurrentOrder] = useState(order)

  // Lazy-fetch store to get shop_domain for Shopify admin link
  const { data: storeData } = useQuery({
    queryKey: ['store', currentOrder.store_id],
    queryFn: () => clientApiRequest<Store>(`/admin/stores/${currentOrder.store_id}`),
    enabled: !!currentOrder.store_id,
    staleTime: 300_000,
  })

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
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
        {storeData && (
          <Link href={`/stores/${currentOrder.store_id}`} className="text-sm text-muted-foreground hover:underline">
            {storeData.shop_domain}
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <OrderSummaryCard order={currentOrder} shopDomain={storeData?.shop_domain ?? null} />
          <OrderLineItemsTable items={currentOrder.items} />
        </div>
        <div>
          <OrderStatusPanel order={currentOrder} onStatusChange={setCurrentOrder} />
        </div>
      </div>
    </div>
  )
}
