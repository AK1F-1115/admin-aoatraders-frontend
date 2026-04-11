/**
 * HealthGrid — 3-column system health panel for the /system page.
 *
 * Client component (rendered inside SystemClient which uses TanStack Query).
 * Displays: API/DB, Services, Billing Cron columns.
 */
import type { SystemHealth } from '@/types/system.types'
import { minutesSince, parseCronMessage } from '@/lib/utils'

interface HealthGridProps {
  health: SystemHealth
}

type ChipVariant = 'green' | 'yellow' | 'red' | 'gray'

function Badge({ label, variant }: { label: string; variant: ChipVariant }) {
  const cls: Record<ChipVariant, string> = {
    green: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400',
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  }
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${cls[variant]}`}>
      {label}
    </span>
  )
}

const ICAPS_VARIANT: Record<string, ChipVariant> = {
  active: 'green',
  inactive: 'red',
  failed: 'red',
  unknown: 'yellow',
  unavailable: 'gray',
}

export default function HealthGrid({ health }: HealthGridProps) {
  const cronMinutes = minutesSince(health.cron_last_run?.started_at)
  const cronStale = cronMinutes > 90
  const cronCounts = health.cron_last_run
    ? parseCronMessage(health.cron_last_run.message)
    : null

  const cronStatusVariant: ChipVariant =
    health.cron_last_run?.status === 'success'
      ? 'green'
      : health.cron_last_run?.status === 'partial'
      ? 'yellow'
      : 'red'

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* ── Column 1: API & Database ── */}
      <div className="rounded-xl border bg-card p-5 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          API &amp; Database
        </h3>
        <div className="space-y-2">
          <Badge label="API OK" variant="green" />
          <p className="text-xs text-muted-foreground">
            Uptime:{' '}
            <span className="font-mono text-foreground" title={`${health.uptime_seconds}s`}>
              {health.uptime}
            </span>
          </p>
          <Badge
            label={
              health.database.status === 'ok'
                ? 'Database OK'
                : `DB Error: ${health.database.error ?? 'unknown'}`
            }
            variant={health.database.status === 'ok' ? 'green' : 'red'}
          />
          <div className="flex flex-wrap gap-1 pt-1">
            <span className="text-xs text-muted-foreground">Alembic:</span>
            {health.alembic_heads.map((head, i) => (
              <code
                key={i}
                className={`rounded px-1.5 py-0.5 text-xs font-mono ${
                  head.startsWith('error:')
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {head}
              </code>
            ))}
          </div>
        </div>
      </div>

      {/* ── Column 2: Services ── */}
      <div className="rounded-xl border bg-card p-5 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Services
        </h3>
        <div className="space-y-2">
          <Badge label="aoa-traders active" variant="green" />
          <Badge
            label={`icaps-watcher: ${health.services.icaps_watcher}`}
            variant={ICAPS_VARIANT[health.services.icaps_watcher] ?? 'gray'}
          />
          {health.services.icaps_watcher === 'unavailable' && (
            <p className="text-xs text-muted-foreground">
              (dev machine — not an error)
            </p>
          )}
        </div>
      </div>

      {/* ── Column 3: Billing Cron ── */}
      <div className="rounded-xl border bg-card p-5 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Billing Cron
        </h3>
        <div className="space-y-2">
          {/* Pending charges */}
          <Badge
            label={
              health.pending_charges === 0
                ? '0 pending charges'
                : health.pending_charges <= 10
                ? `${health.pending_charges} orders pending charge`
                : `${health.pending_charges} pending — cron may be stalled`
            }
            variant={
              health.pending_charges === 0
                ? 'green'
                : health.pending_charges <= 10
                ? 'yellow'
                : 'red'
            }
          />

          {/* Cron last run */}
          {health.cron_last_run === null ? (
            <Badge label="Cron has never run" variant="red" />
          ) : (
            <>
              <Badge
                label={health.cron_last_run.status}
                variant={cronStatusVariant}
              />
              <p
                className="text-xs text-muted-foreground"
                title={health.cron_last_run.started_at}
              >
                Last run: {cronMinutes}m ago
                {health.cron_last_run.finished_at && (
                  <span className="ml-1">
                    ({new Date(health.cron_last_run.finished_at).toLocaleTimeString()})
                  </span>
                )}
              </p>
              {cronCounts && (
                <div className="flex flex-wrap gap-1">
                  <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                    {cronCounts.processed} processed
                  </span>
                  <span className="rounded bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-400 px-1.5 py-0.5 text-xs">
                    {cronCounts.ok} ok
                  </span>
                  {cronCounts.failed > 0 && (
                    <span className="rounded bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-400 px-1.5 py-0.5 text-xs">
                      {cronCounts.failed} failed
                    </span>
                  )}
                </div>
              )}
              {cronStale && (
                <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
                  ⚠ Stale — cron may not be running
                </p>
              )}
            </>
          )}

          {/* Sync errors */}
          <Badge
            label={
              health.sync_errors_24h === 0
                ? '0 sync errors (24h)'
                : `${health.sync_errors_24h} sync error${health.sync_errors_24h !== 1 ? 's' : ''} in last 24h`
            }
            variant={health.sync_errors_24h === 0 ? 'green' : 'red'}
          />
        </div>
      </div>
    </div>
  )
}
