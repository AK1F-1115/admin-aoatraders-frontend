'use client'

import { useStoreCatalogSummary } from '@/lib/queries/useStoreCatalog'
import LoadingSpinner from '@/components/common/LoadingSpinner'

interface CatalogTabProps {
  storeId: number
}

/**
 * Lazy-loaded catalog summary tab for store detail page.
 * Only fetches when this tab is first opened (enabled by parent mounting this component).
 */
export default function CatalogTab({ storeId }: CatalogTabProps) {
  const { data, isLoading, error } = useStoreCatalogSummary(storeId)

  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner size="md" /></div>
  if (error || !data) return <p className="py-4 text-sm text-muted-foreground">Failed to load catalog data.</p>

  const slotPct = data.slots_total ? (data.slots_used / data.slots_total) * 100 : null
  const nearLimit = data.slots_remaining !== null && data.slots_total !== null && data.slots_remaining / data.slots_total < 0.05

  return (
    <div className="space-y-6">
      {/* Slot usage */}
      <div className="rounded-lg border p-5 space-y-3">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Slot Usage</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tabular-nums">{data.slots_used.toLocaleString()}</span>
          <span className="text-muted-foreground">
            / {data.slots_total !== null ? data.slots_total.toLocaleString() : '∞'} slots
          </span>
        </div>
        {slotPct !== null && (
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${nearLimit ? 'bg-red-500' : slotPct > 75 ? 'bg-yellow-500' : 'bg-primary'}`}
              style={{ width: `${Math.min(slotPct, 100)}%` }}
            />
          </div>
        )}
        {nearLimit && <p className="text-xs text-red-600 font-medium">⚠ Store is near its slot limit</p>}
        {data.shopify_unpushed_count > 0 && (
          <p className="text-xs text-yellow-600">{data.shopify_unpushed_count.toLocaleString()} products queued for Shopify push</p>
        )}
      </div>

      {/* Product breakdown stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Retail', value: data.retail_count },
          { label: 'VDS', value: data.vds_count },
          { label: 'Pushed to Shopify', value: data.shopify_pushed_count },
          { label: 'Queued / Unpushed', value: data.shopify_unpushed_count },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold tabular-nums">{value.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Categories */}
      {data.categories.length > 0 ? (
        <div className="rounded-lg border p-5 space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Top Categories</h3>
          <div className="space-y-2">
            {data.categories.slice(0, 10).map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground capitalize">{cat.name.toLowerCase()}</span>
                <span className="tabular-nums font-medium">{cat.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          No products synced yet
        </div>
      )}

      {/* Brands */}
      {data.brands.length > 0 && (
        <div className="rounded-lg border p-5 space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Top Brands</h3>
          <div className="space-y-2">
            {data.brands.slice(0, 10).map((brand) => (
              <div key={brand.name} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground capitalize">{brand.name.toLowerCase()}</span>
                <span className="tabular-nums font-medium">{brand.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
