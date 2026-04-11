'use client'

import { useState } from 'react'
import { useUpdateMapping } from '@/lib/queries/useMappings'
import type { Mapping } from '@/types/mapping.types'

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
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
        {fmtDate(mapping.updated_at)}
      </td>
    </tr>
  )
}

/**
 * MappingTable — supplier SKU → Shopify variant mapping editor.
 * Active column is an inline toggle that auto-saves via PATCH /admin/mappings/{id}.
 *
 * Confirmed fields: id, supplier, supplier_sku, shopify_variant_id,
 *   inventory_item_id, location_id, active, last_synced_quantity,
 *   created_at, updated_at
 */
export default function MappingTable({ mappings }: { mappings: Mapping[] }) {
  if (mappings.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground text-sm">
        No mappings found.
      </div>
    )
  }

  return (
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
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mappings.map((mapping) => (
              <MappingRow key={mapping.id} mapping={mapping} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
        {mappings.length.toLocaleString()} mapping{mappings.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
