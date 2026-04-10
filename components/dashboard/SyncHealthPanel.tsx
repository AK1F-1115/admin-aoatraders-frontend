'use client'

import { cn, getSyncHealthColor, formatRelativeTime, parseCronMessage } from '@/lib/utils'
import SyncTriggerButton from '@/components/common/SyncTriggerButton'
import type { SyncSummaryRow } from '@/types/sync.types'

/** Human-readable labels for each known job_type identifier */
const SYNC_LABELS: Record<string, string> = {
  essendant_ingest: 'ICAPS Ingest',
  retail_product_push: 'Retail Products',
  vds_product_push: 'VDS Products',
  price_sync: 'Price Sync',
  inventory_sync: 'Inventory Sync',
  status_sync: 'Status Sync',
  auto_charge_cron: 'Billing Cron',
}

const COLOR_DOT: Record<'green' | 'yellow' | 'red' | 'gray', string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  gray: 'bg-muted-foreground/40',
}

interface SyncHealthPanelProps {
  syncSummary: SyncSummaryRow[] | null
  /** Server Action — POST /admin/sync/essendant/run */
  onEssendantSync: () => Promise<void>
  /** Server Action — POST /admin/sync/shopify/run */
  onShopifySync: () => Promise<void>
}

/**
 * Sync Health panel shown on the dashboard sidebar column.
 *
 * Client component so it can host the interactive SyncTriggerButtons.
 * Receives pre-fetched summary from GET /admin/sync/summary (one row per job_type).
 *
 * Color legend:
 *   🟢 green  — last run < 2 h ago AND status = success
 *   🟡 yellow — last run 2–6 h ago
 *   🔴 red    — last run > 6 h ago OR status = error
 *   ⚫ gray   — never run OR status = skipped
 */
export default function SyncHealthPanel({
  syncSummary,
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
        {!syncSummary || !Array.isArray(syncSummary) ? (
          <p className="px-6 py-4 text-sm text-muted-foreground">Sync status unavailable.</p>
        ) : syncSummary.length === 0 ? (
          <p className="px-6 py-4 text-sm text-muted-foreground">No sync runs recorded yet.</p>
        ) : (
          syncSummary.map((sync) => {
            const color = getSyncHealthColor(sync.finished_at, sync.status)
            const isCron = sync.job_type === 'auto_charge_cron'
            const cronCounts = isCron && sync.message ? parseCronMessage(sync.message) : null
            return (
              <div
                key={sync.job_type}
                className="flex items-start justify-between gap-4 px-6 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={cn('h-2.5 w-2.5 rounded-full shrink-0 mt-0.5', COLOR_DOT[color])}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <span className="text-sm font-medium truncate block">
                      {SYNC_LABELS[sync.job_type] ?? sync.job_type}
                    </span>
                    {cronCounts && (
                      <span className="text-xs text-muted-foreground">
                        {cronCounts.processed} processed &middot; {cronCounts.ok} ok
                        {cronCounts.failed > 0 && (
                          <span className="text-destructive"> &middot; {cronCounts.failed} failed</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatRelativeTime(sync.finished_at)}
                  </span>
                  {sync.status === 'error' && sync.message && !isCron && (
                    <p className="text-xs text-destructive truncate max-w-[180px] text-right">
                      {sync.message}
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
