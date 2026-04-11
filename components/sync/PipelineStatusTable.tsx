'use client'

import SyncTriggerButton from '@/components/common/SyncTriggerButton'
import SyncStatusBadge from '@/components/sync/SyncStatusBadge'
import { triggerEssendantSync, triggerShopifySync } from '@/lib/actions/sync'
import { formatRelativeTime, formatDuration, parseCronMessage } from '@/lib/utils'
import type { SyncSummaryRow, PipelineMeta } from '@/types/sync.types'
import { PIPELINE_META } from '@/types/sync.types'

/**
 * Known pipeline ordering — ensures consistent row order even if
 * the API returns jobs in a different sequence.
 */
const JOB_ORDER = [
  'ingest',
  'promote_catalog',
  'promote_vds_catalog',
  'promote_wholesale_catalog',
  'push_shopify',
  'push_shopify_prices',
  'auto_charge_cron',
]

interface PipelineStatusTableProps {
  rows: SyncSummaryRow[]
}

function RecordsCell({ row, meta }: { row: SyncSummaryRow; meta: PipelineMeta }) {
  if (meta.recordsField === 'message') {
    if (!row.message) return <span className="text-muted-foreground">—</span>
    const { processed, ok, failed } = parseCronMessage(row.message)
    return (
      <span className="text-xs tabular-nums">
        {processed} processed / {ok} ok /{' '}
        <span className={failed > 0 ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
          {failed} failed
        </span>
      </span>
    )
  }
  const val = row[meta.recordsField as keyof SyncSummaryRow] as number | null
  if (val == null) return <span className="text-muted-foreground">—</span>
  return <span className="tabular-nums">{val.toLocaleString()}</span>
}

function TriggerCell({ meta }: { meta: PipelineMeta }) {
  if (!meta.triggerable) return <span className="text-muted-foreground text-xs">—</span>
  const action = meta.triggerType === 'essendant' ? triggerEssendantSync : triggerShopifySync
  return <SyncTriggerButton action={action} label="Trigger" className="py-1 text-xs" />
}

export default function PipelineStatusTable({ rows }: PipelineStatusTableProps) {
  // Index rows by job_type for O(1) lookup
  const byType = Object.fromEntries(rows.map((r) => [r.job_type, r]))

  // Merge known jobs with any unknown ones returned by the API
  const unknownRows = rows.filter((r) => !JOB_ORDER.includes(r.job_type))
  const allJobs = [...JOB_ORDER, ...unknownRows.map((r) => r.job_type)]

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="pb-3 pr-4 font-medium text-muted-foreground">Pipeline</th>
            <th className="pb-3 pr-4 font-medium text-muted-foreground">Last Run</th>
            <th className="pb-3 pr-4 font-medium text-muted-foreground">Duration</th>
            <th className="pb-3 pr-4 font-medium text-muted-foreground">Records</th>
            <th className="pb-3 pr-4 font-medium text-muted-foreground">Status</th>
            <th className="pb-3 font-medium text-muted-foreground">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {allJobs.map((jobType) => {
            const row = byType[jobType]
            const meta: PipelineMeta = PIPELINE_META[jobType] ?? {
              label: jobType,
              recordsField: 'updates_sent',
              triggerable: false,
            }

            if (!row) {
              return (
                <tr key={jobType} className="text-muted-foreground">
                  <td className="py-3 pr-4 font-medium text-foreground">{meta.label}</td>
                  <td className="py-3 pr-4">Never run</td>
                  <td className="py-3 pr-4">—</td>
                  <td className="py-3 pr-4">—</td>
                  <td className="py-3 pr-4">
                    <SyncStatusBadge status={null} />
                  </td>
                  <td className="py-3">
                    <TriggerCell meta={meta} />
                  </td>
                </tr>
              )
            }

            return (
              <tr key={jobType} className="hover:bg-muted/30 transition-colors">
                <td className="py-3 pr-4 font-medium">{meta.label}</td>
                <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">
                  {formatRelativeTime(row.started_at)}
                </td>
                <td className="py-3 pr-4 text-muted-foreground tabular-nums whitespace-nowrap">
                  {formatDuration(row.started_at, row.finished_at)}
                </td>
                <td className="py-3 pr-4">
                  <RecordsCell row={row} meta={meta} />
                </td>
                <td className="py-3 pr-4">
                  <SyncStatusBadge status={row.status} />
                </td>
                <td className="py-3">
                  <TriggerCell meta={meta} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
