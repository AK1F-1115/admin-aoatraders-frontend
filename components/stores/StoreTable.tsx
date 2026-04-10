'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { Store } from '@/types/store.types'
import StatusBadge from '@/components/common/StatusBadge'
import { stripShopifyDomain, formatRelativeTime } from '@/lib/utils'

import StoreCatalogCell from '@/components/stores/StoreCatalogCell'

const PLAN_OPTIONS = ['All', 'free', 'starter', 'growth', 'pro'] as const
const STATUS_OPTIONS = ['All', 'active', 'inactive'] as const

interface StoreTableProps {
  stores: Store[]
}

/**
 * Client component — store list table with plan/status filters + search.
 * Receives pre-fetched stores from the parent Server Component.
 */
export default function StoreTable({ stores }: StoreTableProps) {
  const [planFilter, setPlanFilter] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return stores.filter((s) => {
      if (planFilter !== 'All' && (s.subscription_plan_slug ?? 'free') !== planFilter) return false
      if (statusFilter === 'active' && !s.active) return false
      if (statusFilter === 'inactive' && s.active) return false
      if (search) {
        const q = search.toLowerCase()
        if (!s.shop_domain.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [stores, planFilter, statusFilter, search])

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <input
          type="search"
          placeholder="Search stores…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-56"
        />

        {/* Plan filter */}
        <div className="flex items-center gap-1 rounded-md border border-input bg-background p-1 text-sm">
          {PLAN_OPTIONS.map((p) => (
            <button
              key={p}
              onClick={() => setPlanFilter(p)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                planFilter === p
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p === 'All' ? 'All Plans' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 rounded-md border border-input bg-background p-1 text-sm">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s === 'All' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} / {stores.length} stores
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <p className="text-sm font-medium">No stores found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your filters.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                {['Store', 'Plan', 'Status', 'Products / Slots', 'Last Sync', 'Auto Push', ''].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((store) => (
                <tr key={store.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">
                    {stripShopifyDomain(store.shop_domain)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={store.subscription_plan_slug ?? 'free'}
                      label={store.subscription_plan_name ?? 'Free'}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={store.active ? 'active' : 'cancelled'} label={store.active ? 'Active' : 'Inactive'} />
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    <StoreCatalogCell storeId={store.id} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {formatRelativeTime(store.last_sync_at)}
                  </td>
                  <td className="px-4 py-3">
                    {(store.sync_config?.['push_retail'] || store.sync_config?.['push_vds']) ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                        Enabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        Disabled
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/stores/${store.id}`}
                      className="inline-flex items-center rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
