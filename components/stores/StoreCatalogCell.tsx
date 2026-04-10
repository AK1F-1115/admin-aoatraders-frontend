'use client'

import { useStoreCatalogSummary } from '@/lib/queries/useStoreCatalog'

/**
 * Per-row cell in the stores table showing slot usage from catalog-summary.
 * Lazy-loads independently per row — TanStack Query deduplicates and caches.
 */
export default function StoreCatalogCell({ storeId }: { storeId: number }) {
  const { data, isLoading } = useStoreCatalogSummary(storeId)

  if (isLoading) return <span className="text-muted-foreground">…</span>
  if (!data) return <span className="text-muted-foreground">—</span>

  const total = data.slots_total !== null ? data.slots_total.toLocaleString() : '∞'
  const nearLimit =
    data.slots_remaining !== null &&
    data.slots_total !== null &&
    data.slots_remaining / data.slots_total < 0.05

  return (
    <span className={`tabular-nums ${nearLimit ? 'text-red-600 font-medium' : ''}`}>
      {data.slots_used.toLocaleString()} / {total}
      {data.shopify_unpushed_count > 0 && (
        <span
          className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-yellow-500 align-middle"
          title={`${data.shopify_unpushed_count} queued for Shopify push`}
        />
      )}
    </span>
  )
}
