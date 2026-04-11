'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useUpdateMapping } from '@/lib/queries/useMappings'
import type { Mapping } from '@/types/mapping.types'

const PAGE_SIZE = 50

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function truncate(str: string, len = 18): string {
  return str.length > len ? str.slice(0, len) + '…' : str
}

/**
 * MappingRow — owns its own optimistic active toggle with per-row loading state.
 * Reverts on mutation error.
 */
function MappingRow({ mapping }: { mapping: Mapping }) {
  const { mutate, isPending } = useUpdateMapping()
  const [active, setActive] = useState(mapping.active)

  function handleToggle() {
    const next = !active
    setActive(next)
    mutate(
      { id: mapping.id, body: { active: next } },
      { onError: () => setActive(mapping.active) },
    )
  }

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3 text-xs font-medium">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-mono">
          {mapping.supplier}
        </span>
      </td>
      <td className="px-4 py-3 font-mono text-xs">{mapping.supplier_sku}</td>
      <td
        className="px-4 py-3 font-mono text-xs text-muted-foreground"
        title={mapping.shopify_variant_id}
      >
        {truncate(mapping.shopify_variant_id)}
      </td>
      <td
        className="px-4 py-3 font-mono text-xs text-muted-foreground"
        title={mapping.location_id}
      >
        {truncate(mapping.location_id)}
      </td>
      <td className="px-4 py-3">
        <button
          onClick={handleToggle}
          disabled={isPending}
          aria-label={active ? 'Deactivate mapping' : 'Activate mapping'}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
            active ? 'bg-primary' : 'bg-muted-foreground/30'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition-transform ${
              active ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </td>
      <td className="px-4 py-3 text-sm tabular-nums text-right">
        {mapping.last_synced_quantity ?? <span className="text-muted-foreground">—</span>}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
        {fmtDate(mapping.created_at)}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
        {fmtDate(mapping.updated_at)}
      </td>
    </tr>
  )
}

/**
 * MappingTable — supplier SKU → Shopify variant mapping editor.
 *
 * Features:
 * - Search by SKU, variant ID, or supplier name
 * - Filter by supplier (dropdown)
 * - Filter by active status (All / Active / Inactive)
 * - Pagination (50 rows per page)
 * - Active toggle auto-saves via PATCH /admin/mappings/{id} (optimistic + revert)
 *
 * Confirmed fields: id, supplier, supplier_sku, shopify_variant_id,
 *   inventory_item_id, location_id, active, last_synced_quantity,
 *   created_at, updated_at
 */
export default function MappingTable({ mappings, serverTotal }: { mappings: Mapping[]; serverTotal?: number }) {
  const [search, setSearch] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('all')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [page, setPage] = useState(0)

  function resetPage() { setPage(0) }

  // Unique supplier values for the dropdown
  const suppliers = useMemo(
    () => ['all', ...Array.from(new Set(mappings.map((m) => m.supplier))).sort()],
    [mappings],
  )

  // Apply search + filters
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return mappings.filter((m) => {
      if (supplierFilter !== 'all' && m.supplier !== supplierFilter) return false
      if (activeFilter === 'active' && !m.active) return false
      if (activeFilter === 'inactive' && m.active) return false
      if (q) {
        return (
          m.supplier_sku.toLowerCase().includes(q) ||
          m.shopify_variant_id.toLowerCase().includes(q) ||
          m.supplier.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [mappings, search, supplierFilter, activeFilter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const clampedPage = Math.min(page, Math.max(0, totalPages - 1))
  const paginated = filtered.slice(clampedPage * PAGE_SIZE, (clampedPage + 1) * PAGE_SIZE)

  if (mappings.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground text-sm">
        No mappings found.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search SKU, variant ID or supplier…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage() }}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Supplier filter */}
        <select
          value={supplierFilter}
          onChange={(e) => { setSupplierFilter(e.target.value); resetPage() }}
          className="py-2 pl-3 pr-8 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {suppliers.map((s) => (
            <option key={s} value={s}>
              {s === 'all' ? 'All suppliers' : s}
            </option>
          ))}
        </select>

        {/* Active status filter */}
        <div className="flex rounded-md border border-border overflow-hidden text-sm">
          {(['all', 'active', 'inactive'] as const).map((v) => (
            <button
              key={v}
              onClick={() => { setActiveFilter(v); resetPage() }}
              className={`px-3 py-2 capitalize transition-colors ${
                activeFilter === v
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:bg-muted'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-160">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Supplier</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">SKU</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Shopify Variant</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Location</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Active</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Last Qty</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground text-sm">
                    No results match your filters.
                  </td>
                </tr>
              ) : (
                paginated.map((mapping) => (
                  <MappingRow key={mapping.id} mapping={mapping} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: count + pagination */}
        <div className="px-4 py-3 border-t border-border bg-muted/30 flex items-center justify-between gap-4 flex-wrap">
          <span className="text-xs text-muted-foreground">
            {filtered.length.toLocaleString()} result{filtered.length !== 1 ? 's' : ''}
            {filtered.length !== mappings.length && ` (filtered from ${mappings.length.toLocaleString()} loaded)`}
            {serverTotal != null && serverTotal > mappings.length && ` — ${serverTotal.toLocaleString()} total on server`}
            {totalPages > 1 && ` — page ${clampedPage + 1} of ${totalPages}`}
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={clampedPage === 0}
                className="p-1.5 rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={clampedPage >= totalPages - 1}
                className="p-1.5 rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
