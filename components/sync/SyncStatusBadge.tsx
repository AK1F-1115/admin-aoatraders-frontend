/**
 * SyncStatusBadge — colour-coded pill for sync pipeline job statuses.
 *
 * Handles: success | partial | error | failed | running | skipped | null
 */

const STYLES: Record<string, string> = {
  success: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400',
  partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  error:   'bg-red-100   text-red-800   dark:bg-red-900/40   dark:text-red-400',
  failed:  'bg-red-100   text-red-800   dark:bg-red-900/40   dark:text-red-400',
  running: 'bg-blue-100  text-blue-800  dark:bg-blue-900/40  dark:text-blue-400',
  skipped: 'bg-gray-100  text-gray-600  dark:bg-gray-800     dark:text-gray-400',
}

const LABELS: Record<string, string> = {
  success: 'Success',
  partial: 'Partial',
  error:   'Error',
  failed:  'Failed',
  running: 'Running',
  skipped: 'Skipped',
}

interface SyncStatusBadgeProps {
  status: string | null
  className?: string
}

export default function SyncStatusBadge({ status, className = '' }: SyncStatusBadgeProps) {
  const key = status?.toLowerCase() ?? ''
  const colourClass = STYLES[key] ?? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
  const label = LABELS[key] ?? (status ? status : 'Never run')

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colourClass} ${className}`}
    >
      {label}
    </span>
  )
}
