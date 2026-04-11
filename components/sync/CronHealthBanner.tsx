import { AlertTriangle } from 'lucide-react'
import type { SyncSummaryRow } from '@/types/sync.types'
import { minutesSince } from '@/lib/utils'

interface CronHealthBannerProps {
  cronRow: SyncSummaryRow | undefined
}

/**
 * Shown when auto_charge_cron is stale (>90 min) or in a failed/partial state.
 * Yellow strip = stale but last run was ok.
 * Red strip = failed / partial.
 */
export default function CronHealthBanner({ cronRow }: CronHealthBannerProps) {
  if (!cronRow) return null

  const stale = minutesSince(cronRow.started_at) > 90
  const failed = cronRow.status === 'failed' || cronRow.status === 'partial'

  if (!stale && !failed) return null

  const isRed = failed
  const strip = isRed
    ? 'bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-900'
    : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-900'
  const icon = isRed
    ? 'text-red-600 dark:text-red-400'
    : 'text-yellow-700 dark:text-yellow-400'
  const text = isRed
    ? 'text-red-800 dark:text-red-300'
    : 'text-yellow-800 dark:text-yellow-300'

  const message = isRed
    ? `Billing Cron last run ended with status "${cronRow.status}". Review the pipeline logs.`
    : 'Billing Cron has not run in over 90 minutes — the cron job may need attention.'

  return (
    <div className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${strip}`}>
      <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${icon}`} aria-hidden="true" />
      <p className={`text-sm ${text}`}>{message}</p>
    </div>
  )
}
