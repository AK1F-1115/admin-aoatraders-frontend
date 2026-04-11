'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import type { TopProduct } from '@/types/analytics.types'

interface Props {
  products: TopProduct[]
  isLoading: boolean
}

export default function TopProductsTable({ products, isLoading }: Props) {
  const [limit, setLimit] = useState(20)
  const visible = products.slice(0, limit)

  if (isLoading) {
    return <div className="h-64 rounded-lg border border-border bg-card animate-pulse" />
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <p className="text-sm font-medium">Top Products by Revenue</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">SKU</th>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">Title</th>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">Supplier</th>
              <th className="px-4 py-2 text-right font-medium text-muted-foreground">Orders</th>
              <th className="px-4 py-2 text-right font-medium text-muted-foreground">AOA Revenue</th>
              <th className="px-4 py-2 text-right font-medium text-muted-foreground">Avg Margin %</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((p, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-2.5 font-mono text-xs">
                  {p.aoa_sku ?? '(unresolved SKU)'}
                </td>
                <td className="max-w-xs truncate px-4 py-2.5">{p.title ?? '—'}</td>
                <td className="px-4 py-2.5">{p.supplier ?? '—'}</td>
                <td className="px-4 py-2.5 text-right">{p.orders_count.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-right">
                  {formatCurrency(p.total_merchant_revenue)}
                </td>
                <td className="px-4 py-2.5 text-right text-muted-foreground">—</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!products.length && (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            No product data for this period
          </p>
        )}
      </div>
      {products.length > limit && (
        <div className="border-t border-border px-4 py-3">
          <button
            className="text-sm text-primary hover:underline"
            onClick={() => setLimit((l) => l + 20)}
          >
            Load more ({products.length - limit} remaining)
          </button>
        </div>
      )}
    </div>
  )
}
