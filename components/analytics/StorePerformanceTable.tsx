'use client'

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import { formatDomain } from '@/utils/format'
import type { StoreAnalytics } from '@/types/analytics.types'

const COLUMNS: ColumnDef<StoreAnalytics>[] = [
  {
    accessorKey: 'shop_domain',
    header: 'Store',
    cell: (i) => formatDomain(i.getValue<string>()),
  },
  {
    accessorKey: 'plan',
    header: 'Plan',
    cell: (i) => <span className="capitalize">{i.getValue<string | null>() ?? '—'}</span>,
  },
  {
    accessorKey: 'active_products',
    header: 'Products',
    cell: (i) => i.getValue<number>().toLocaleString(),
  },
  {
    accessorKey: 'orders_count',
    header: 'Orders',
    cell: (i) => i.getValue<number>().toLocaleString(),
  },
  {
    accessorKey: 'total_merchant_revenue',
    header: 'AOA Revenue',
    cell: (i) => formatCurrency(i.getValue<number>()),
  },
  {
    accessorKey: 'margin_pct',
    header: 'Margin %',
    cell: () => (
      <span
        title="Margin tracking requires supplier cost data — coming soon"
        className="text-muted-foreground"
      >
        —
      </span>
    ),
  },
]

interface Props {
  stores: StoreAnalytics[]
  isLoading: boolean
}

export default function StorePerformanceTable({ stores, isLoading }: Props) {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'total_merchant_revenue', desc: true },
  ])

  const table = useReactTable({
    data: stores,
    columns: COLUMNS,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (isLoading) {
    return <div className="h-64 rounded-lg border border-border bg-card animate-pulse" />
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <p className="text-sm font-medium">Store Performance</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-border bg-muted/40">
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="cursor-pointer select-none px-4 py-2 text-left font-medium text-muted-foreground hover:text-foreground"
                    onClick={h.column.getToggleSortingHandler()}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {({ asc: ' ↑', desc: ' ↓' } as Record<string, string>)[
                      h.column.getIsSorted() as string
                    ] ?? ''}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/30"
                onClick={() => router.push(`/stores/${row.original.store_id}`)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!stores.length && (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            No store data for this period
          </p>
        )}
      </div>
    </div>
  )
}
