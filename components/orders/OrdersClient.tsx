'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { clientApiRequest } from '@/lib/clientApi'
import { useOrders } from '@/lib/queries/useOrders'
import type { Store } from '@/types/store.types'
import OrderFilters from './OrderFilters'
import OrderTable from './OrderTable'

export const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'pending_purchase', label: 'Pending Purchase' },
  { value: 'purchased', label: 'Purchased' },
  { value: 'fulfillment_sent', label: 'Fulfillment Sent' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
] as const

/**
 * Client wrapper for the Order Queue page.
 * Manages filter/search/page state and delegates rendering to sub-components.
 */
export default function OrdersClient() {
  const [status, setStatus] = useState('')
  const [storeId, setStoreId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, error } = useOrders({ status, store_id: storeId, search, page })

  // Fetch stores for the filter dropdown
  const { data: storesRaw } = useQuery({
    queryKey: ['stores', 'all'],
    queryFn: () => clientApiRequest<Store[] | { items?: Store[] }>('/admin/stores?per_page=200'),
    staleTime: 60_000,
  })
  const stores: Store[] = Array.isArray(storesRaw)
    ? storesRaw
    : ((storesRaw as { items?: Store[] } | null)?.items ?? [])

  const resetPage = (fn: () => void) => { fn(); setPage(1) }

  return (
    <div className="flex-1 space-y-4 p-6 lg:p-8">
      <h1 className="text-2xl font-bold tracking-tight">Orders</h1>

      <OrderFilters
        statuses={STATUS_TABS}
        stores={stores}
        activeStatus={status}
        activeStore={storeId}
        search={search}
        onStatus={(s) => resetPage(() => setStatus(s))}
        onStore={(id) => resetPage(() => setStoreId(id))}
        onSearch={(s) => resetPage(() => setSearch(s))}
      />

      {isError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Failed to load orders: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      )}

      <OrderTable
        orders={data?.items ?? []}
        isLoading={isLoading}
        page={page}
        total={data?.total ?? 0}
        onPage={setPage}
      />
    </div>
  )
}
