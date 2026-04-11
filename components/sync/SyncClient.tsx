'use client'

import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { useSyncSummary } from '@/lib/queries/useSync'
import PipelineStatusTable from '@/components/sync/PipelineStatusTable'
import GlobalSyncControls from '@/components/sync/GlobalSyncControls'
import CronHealthBanner from '@/components/sync/CronHealthBanner'
import type { SyncSummaryRow } from '@/types/sync.types'

interface SyncClientProps {
  initialData: SyncSummaryRow[]
}

/**
 * Client component that owns the interactive state for the Sync page.
 * Receives initial SSR data; live-updates via useSyncSummary (30s poll).
 */
export default function SyncClient({ initialData }: SyncClientProps) {
  const queryClient = useQueryClient()
  const { data: rows = initialData, isFetching } = useSyncSummary()

  const cronRow = rows.find((r) => r.job_type === 'auto_charge_cron')

  return (
    <div className="space-y-6">
      {/* Cron health alert — only visible when stale or failed */}
      <CronHealthBanner cronRow={cronRow} />

      {/* Global trigger controls + manual refresh */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <GlobalSyncControls />
        <button
          type="button"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['sync', 'summary'] })}
          disabled={isFetching}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          aria-label="Refresh sync status"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Pipeline status table */}
      <div className="rounded-lg border border-border bg-card">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Pipeline Status
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Live status of all sync pipelines — auto-refreshes every 30 seconds
          </p>
        </div>
        <div className="px-6 py-4">
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No sync history found. Run a sync to see status here.
            </p>
          ) : (
            <PipelineStatusTable rows={rows} />
          )}
        </div>
      </div>
    </div>
  )
}
