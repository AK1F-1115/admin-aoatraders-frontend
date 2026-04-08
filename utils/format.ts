/**
 * Formatting utilities for AOA Traders Admin.
 * All functions are pure and safe to call with null/undefined values.
 */

/**
 * Strip ".myshopify.com" from a Shopify shop domain.
 * e.g. "my-store.myshopify.com" → "my-store"
 */
export function formatDomain(shopDomain: string | null | undefined): string {
  if (!shopDomain) return '—'
  return shopDomain.replace(/\.myshopify\.com$/, '')
}

/**
 * Convert a decimal markup value (0–1) to a human-readable percentage string.
 * e.g. 0.25 → "25%"
 * Values stored in DB are decimals; display multiplies by 100.
 */
export function formatMarkup(decimal: number | null | undefined): string {
  if (decimal == null) return '—'
  return `${(decimal * 100).toFixed(1)}%`
}

/**
 * Format a number as USD currency.
 * e.g. 1234.5 → "$1,234.50"
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency = 'USD',
): string {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format a percentage value (already multiplied — 0–100 range).
 * e.g. 18.5 → "18.5%"
 * Used for margin_pct fields from the backend (which are already percentages, not decimals).
 */
export function formatPercent(value: number | null | undefined): string {
  if (value == null) return '—'
  return `${value.toFixed(1)}%`
}

/**
 * Return a human-friendly relative time string.
 * e.g. "2 hours ago", "just now"
 */
export function formatRelativeTime(isoString: string | null | undefined): string {
  if (!isoString) return '—'
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return '—'

  const diffMs = Date.now() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}
