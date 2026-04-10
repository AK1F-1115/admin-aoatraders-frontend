import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Strip `.myshopify.com` suffix from a Shopify shop domain. */
export function stripShopifyDomain(domain: string): string {
  return domain.replace(/\.myshopify\.com$/, '')
}

/**
 * Format a number as USD currency with no decimal places.
 * e.g. 1234.5 → "$1,235"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Convert an ISO date string to a human-readable relative label.
 * Returns "Never" for null/undefined inputs.
 */
export function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Never'
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Return a health color based on last sync timestamp and optional status string.
 *
 * - running → green
 * - error   → red
 * - null    → gray  (never synced)
 * - < 2h    → green
 * - 2–6h   → yellow
 * - > 6h   → red
 */
export function getSyncHealthColor(
  lastRun: string | null | undefined,
  status?: string | null,
): 'green' | 'yellow' | 'red' | 'gray' {
  if (status === 'running') return 'green'
  if (status === 'error') return 'red'
  if (status === 'skipped') return 'gray'
  if (!lastRun) return 'gray'
  const hours = (Date.now() - new Date(lastRun).getTime()) / 3_600_000
  if (hours < 2) return 'green'
  if (hours < 6) return 'yellow'
  return 'red'
}

/** Number of whole minutes since a date string. Returns Infinity for null. */
export function minutesSince(dateStr: string | null | undefined): number {
  if (!dateStr) return Infinity
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 60_000)
}

/**
 * Format a sync job duration from start/finish ISO strings.
 * e.g. 234ms | 3.4s | 2m 14s
 */
export function formatDuration(
  startedAt: string,
  finishedAt: string | null,
): string {
  if (!finishedAt) return '—'
  const ms = new Date(finishedAt).getTime() - new Date(startedAt).getTime()
  if (ms < 1000) return `${ms}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60_000)}m ${Math.floor((ms % 60_000) / 1000)}s`
}

/** Parse "processed=N ok=N failed=N" cron message into parts. */
export function parseCronMessage(message: string): { processed: number; ok: number; failed: number } {
  const n = (key: string) => {
    const m = message.match(new RegExp(`${key}=(\\d+)`))
    return m ? parseInt(m[1], 10) : 0
  }
  return { processed: n('processed'), ok: n('ok'), failed: n('failed') }
}
