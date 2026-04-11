/**
 * StatusBadge — colour-coded pill for order statuses, store statuses, and plan tiers.
 *
 * Colors sourced from ADMIN_FRONTEND.md §6.2 and spec tables.
 */

// --- Order statuses (ADMIN_FRONTEND.md §5.1, §5.4) ---
const ORDER_STATUS_STYLES = {
  pending_purchase: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  purchased: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400',
  fulfillment_sent: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-400',
  shipped: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400',
  no_aoa_items: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
} as const

// --- Store / subscription statuses (ADMIN_FRONTEND.md §5.2) ---
const STORE_STATUS_STYLES = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400',
  free: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
} as const

// --- Subscription plan tiers (ADMIN_FRONTEND.md §5.2) ---
const PLAN_STYLES = {
  free: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  starter: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400',
  growth: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-400',
  pro: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
} as const

const ALL_STYLES = { ...ORDER_STATUS_STYLES, ...STORE_STATUS_STYLES, ...PLAN_STYLES } as const

type BadgeKey = keyof typeof ALL_STYLES

const DISPLAY_LABELS: Partial<Record<BadgeKey, string>> = {
  pending_purchase: 'Pending Purchase',
  fulfillment_sent: 'Fulfillment Sent',
}

interface StatusBadgeProps {
  status: string
  /** Override display label (defaults to capitalised status key) */
  label?: string
  className?: string
}

function toLabel(status: string): string {
  return (
    DISPLAY_LABELS[status as BadgeKey] ??
    status
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  )
}

export default function StatusBadge({ status, label, className = '' }: StatusBadgeProps) {
  const colourClass =
    ALL_STYLES[status as BadgeKey] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colourClass} ${className}`}
    >
      {label ?? toLabel(status)}
    </span>
  )
}
