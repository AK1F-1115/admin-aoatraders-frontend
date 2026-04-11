'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import { clientApiRequest } from '@/lib/clientApi'
import { formatMoney, formatRelativeTime } from '@/lib/utils'
import StatusBadge from '@/components/common/StatusBadge'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import type { Order } from '@/types/order.types'

const PER_PAGE = 50

function exportCsv(orders: Order[]) {
  const headers = ['Order #', 'Store', 'Customer', 'Product', 'AOA SKU', 'Supplier SKU', 'Amount', 'AOA Cost', 'Status', 'Created']
  const rows = orders.map((o) => [
    o.shopify_order_number ?? '',
    o.store_name ?? '',
    o.customer_name ?? '',
    o.first_item_product_name ?? '',
    o.first_item_aoa_sku ?? '',
    o.first_item_supplier_sku ?? '',
    o.subtotal_price ?? '',
    o.aoa_total_cost ?? '',
    o.status,
    o.created_at,
  ])
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: 'orders.csv',
  })
  a.click()
  URL.revokeObjectURL(a.href)
}

interface OrderTableProps {
  orders: Order[]
  isLoading: boolean
  page: number
  total: number
  onPage: (p: number) => void
}

export default function OrderTable({ orders, isLoading, page, total, onPage }: OrderTableProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [bulkPending, setBulkPending] = useState(false)
  const queryClient = useQueryClient()

  const toggleAll = () =>
    setSelected(selected.size === orders.length ? new Set() : new Set(orders.map((o) => o.id)))
  const toggle = (id: number) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  const markFulfillmentSent = async () => {
    const ids = orders.filter((o) => selected.has(o.id) && o.status === 'purchased').map((o) => o.id)
    if (!ids.length) return
    setBulkPending(true)
    await Promise.allSettled(
      ids.map((id) =>
        clientApiRequest(`/admin/orders/${id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'fulfillment_sent' }),
        }),
      ),
    )
    setSelected(new Set())
    queryClient.invalidateQueries({ queryKey: ['orders'] })
    setBulkPending(false)
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  if (isLoading) {
    return <div className="flex justify-center py-12"><LoadingSpinner size="md" /></div>
  }

  if (!orders.length) {
    return (
      <div className="rounded-md border border-dashed p-12 text-center text-sm text-muted-foreground">
        No orders found.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-md bg-muted px-4 py-2 text-sm">
          <span className="font-medium">{selected.size} selected</span>
          <button
            onClick={markFulfillmentSent}
            disabled={bulkPending}
            className="rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground disabled:opacity-50"
          >
            {bulkPending ? 'Marking…' : 'Mark Fulfillment Sent'}
          </button>
          <button
            onClick={() => exportCsv(orders.filter((o) => selected.has(o.id)))}
            className="rounded border px-3 py-1 text-xs font-medium hover:bg-accent"
          >
            Export CSV
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  checked={selected.size === orders.length && orders.length > 0}
                  onChange={toggleAll}
                  className="h-4 w-4"
                />
              </th>
              {['Order #', 'Store', 'Customer', 'Product', 'AOA SKU', 'Supplier SKU', 'Amount', 'AOA Cost', 'Status', 'Created'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-3 py-3">
                  <input type="checkbox" checked={selected.has(order.id)} onChange={() => toggle(order.id)} className="h-4 w-4" />
                </td>
                <td className="px-4 py-3 font-medium">
                  <Link href={`/orders/${order.id}`} className="hover:underline text-primary">
                    {order.shopify_order_number ?? order.shopify_order_id ?? `#${order.id}`}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                  {order.store_name
                    ? order.store_name.replace('.myshopify.com', '')
                    : <span className="opacity-40">—</span>}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {order.customer_name ?? order.customer_email ?? '—'}
                </td>
                <td className="px-4 py-3 max-w-48">
                  {order.first_item_product_name ? (
                    <span className="block truncate text-sm" title={order.first_item_product_name}>
                      {order.first_item_product_name}
                      {(order.item_count ?? 0) > 1 && (
                        <span className="ml-1 text-xs text-muted-foreground">+{(order.item_count ?? 1) - 1}</span>
                      )}
                    </span>
                  ) : <span className="opacity-40">—</span>}
                </td>
                <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                  {order.first_item_aoa_sku ?? <span className="opacity-40">—</span>}
                </td>
                <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                  {order.first_item_supplier_sku ?? <span className="opacity-40">—</span>}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {order.subtotal_price ? formatMoney(parseFloat(order.subtotal_price)) : '—'}
                </td>
                <td className="px-4 py-3 text-muted-foreground tabular-nums">
                  {order.aoa_total_cost ? formatMoney(parseFloat(order.aoa_total_cost)) : '—'}
                </td>
                <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {formatRelativeTime(order.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <button disabled={page <= 1} onClick={() => onPage(page - 1)}
            className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-accent">
            ← Prev
          </button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => onPage(page + 1)}
            className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-accent">
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
