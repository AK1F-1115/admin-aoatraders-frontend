'use client'

import { cn, getSyncHealthColor, formatRelativeTime } from '@/lib/utils'
import SyncTriggerButton from '@/components/common/SyncTriggerButton'
import type { SyncStatusResponse } from '@/types/sync.types'

/** Human-readable labels for each known sync_type identifier */
const SYNC_LABELS: Record<string, string> = {
  essendant_ingest: 'Essendant Ingest',
  retail_push: 'Retail Push',
  vds_push: 'VDS Push',
  price_sync: 'Price Sync',
  inventory_sync: 'Inventory Sync',
  status_reconcile: 'Status Reconcile',
}

const COLOR_DOT: Record<'green' | 'yellow' | 'red' | 'gray', string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  gray: 'bg-muted-foreground/40',
}

interface SyncHealthPanelProps {
  syncStatus: SyncStatusResponse | null
  /** Server Action — POST /admin/sync/essendant/run */
  onEssendantSync: () => Promise<void>
  /** Server Action — POST /admin/sync/shopify/run */
  onShopifySync: () => Promise<void>
}

/**
 * Sync Health panel shown on the dashboard sidebar column.
 *
 * Client component so it can host the interactive SyncTriggerButtons.
 * Receives pre-fetched sync status from the parent Server Component.
 *
 * Color legend:
 *   🟢 green  — last run < 2 h ago
 *   🟡 yellow — last run 2–6 h ago
 *   🔴 red    — last run > 6 h ago OR status = error
 *   ⚫ gray   — never run
 */
export default function SyncHealthPanel({
  syncStatus,
  onEssendantSync,
  onShopifySync,
}: SyncHealthPanelProps) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b">
        <h2 className="text-base font-semibold">Sync Health</h2>
        <div className="flex items-center gap-2">
          <SyncTriggerButton action={onEssendantSync} label="Essendant" />
          <SyncTriggerButton action={onShopifySync} label="Shopify" />
        </div>
      </div>

      {/* Sync rows */}
      <div className="divide-y">
        {!syncStatus?.syncs ? (
          <p className="px-6 py-4 text-sm text-muted-foreground">Sync status unavailable.</p>
        ) : syncStatus.syncs.length === 0 ? (
          <p className="px-6 py-4 text-sm text-muted-foreground">No sync runs recorded yet.</p>
        ) : (
          syncStatus.syncs.map((sync) => {
            const color = getSyncHealthColor(sync.last_run, sync.status)
            return (
              <div
                key={sync.sync_type}
                className="flex items-start justify-between gap-4 px-6 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={cn('h-2.5 w-2.5 rounded-full shrink-0 mt-0.5', COLOR_DOT[color])}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium truncate">
                    {SYNC_LABELS[sync.sync_type] ?? sync.sync_type}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatRelativeTime(sync.last_run)}
                  </span>
                  {sync.last_error && (
                    <p className="text-xs text-destructive truncate max-w-[180px] text-right">
                      {sync.last_error}
                    </p>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
