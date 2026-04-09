import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  title: string
  /** Formatted string or raw number to display as the headline metric */
  value: string | number
  description?: string
  icon: LucideIcon
  /** Set to true when the data fetch failed — renders an error hint */
  error?: boolean
}

/**
 * Stat card used across the dashboard KPI grid.
 *
 * Displays an icon, a metric title, the headline value, and an optional
 * sub-description. Renders a subtle error state when `error` is true.
 */
export default function KpiCard({
  title,
  value,
  description,
  icon: Icon,
  error = false,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-card p-6 shadow-sm',
        error && 'border-destructive/30',
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        </div>
      </div>

      {error ? (
        <p className="text-sm text-destructive">Failed to load</p>
      ) : (
        <>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1 truncate">{description}</p>
          )}
        </>
      )}
    </div>
  )
}
