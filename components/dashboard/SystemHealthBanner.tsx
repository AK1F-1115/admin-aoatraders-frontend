/**
 * SystemHealthBanner — compact health summary bar shown above KPI cards on /dashboard.
 *
 * Server component: receives pre-fetched SystemHealth from dashboard page.tsx.
 * Color: green strip when all healthy, yellow/red chips for individual issues.
 */
import Link from 'next/link'
import type { SystemHealth } from '@/types/system.types'
import { minutesSince } from '@/lib/utils'

interface SystemHealthBannerProps {
  health: SystemHealth | null
  error?: boolean
}

type ChipVariant = 'green' | 'yellow' | 'red' | 'gray'

function Chip({ label, variant }: { label: string; variant: ChipVariant }) {
  const cls: Record<ChipVariant, string> = {
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${cls[variant]}`}>
      {label}
    </span>
  )
}

export default function SystemHealthBanner({ health, error }: SystemHealthBannerProps) {
  // Silent fail — banner is supplementary; don't block the dashboard
  if (error || !health) return null

  const dbOk = health.database.status === 'ok'
  const icapsStatus = health.services.icaps_watcher
  const icapsOk = icapsStatus === 'active'
  const icapsUnavail = icapsStatus === 'unavailable' // dev machine — not an error
  const cronMinutes = minutesSince(health.cron_last_run?.started_at)
  const cronStale = cronMinutes > 90
  const hasIssues =
    !dbOk ||
    (!icapsOk && !icapsUnavail) ||
    health.pending_charges > 0 ||
    health.sync_errors_24h > 0 ||
    cronStale

  const bannerBg = hasIssues
    ? 'bg-yellow-50 border-yellow-200'
    : 'bg-green-50 border-green-200'

  return (
    <div className={`flex flex-wrap items-center gap-2 rounded-lg border px-4 py-2.5 ${bannerBg}`}>
      {/* DB */}
      <Chip
        label={dbOk ? 'DB OK' : `DB Error: ${health.database.error ?? 'unknown'}`}
        variant={dbOk ? 'green' : 'red'}
      />

      {/* ICAPS watcher */}
      {!icapsUnavail && (
        <Chip
          label={icapsOk ? 'ICAPS Active' : `ICAPS: ${icapsStatus}`}
          variant={icapsOk ? 'green' : icapsStatus === 'unknown' ? 'yellow' : 'red'}
        />
      )}

      {/* Pending charges */}
      {health.pending_charges > 0 && (
        <Chip
          label={`${health.pending_charges} pending charge${health.pending_charges !== 1 ? 's' : ''}`}
          variant="yellow"
        />
      )}

      {/* Sync errors */}
      {health.sync_errors_24h > 0 && (
        <Chip
          label={`${health.sync_errors_24h} sync error${health.sync_errors_24h !== 1 ? 's' : ''} (24h)`}
          variant="yellow"
        />
      )}

      {/* Cron */}
      {health.cron_last_run === null ? (
        <Chip label="Cron: never run" variant="red" />
      ) : (
        <Chip
          label={cronStale ? `Cron stale (${cronMinutes}m ago)` : `Cron: ${cronMinutes}m ago`}
          variant={cronStale ? 'red' : 'green'}
        />
      )}

      <Link
        href="/system"
        className="ml-auto text-xs text-muted-foreground hover:underline whitespace-nowrap"
      >
        View System Console →
      </Link>
    </div>
  )
}
