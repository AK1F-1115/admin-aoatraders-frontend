import { formatCurrency } from '@/lib/utils'
import type { AnalyticsSummary } from '@/types/analytics.types'

function Skeleton() {
  return <div className="h-24 rounded-lg border border-border bg-card animate-pulse" />
}

function KpiCard({
  label,
  value,
  subtext,
}: {
  label: string
  value: string
  subtext?: string
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
      {subtext && <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>}
    </div>
  )
}

interface Props {
  summary: AnalyticsSummary | undefined
  isLoading: boolean
}

export default function AnalyticsKpiCards({ summary, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <KpiCard
        label="Total Orders"
        value={summary?.total_orders.toLocaleString() ?? '—'}
      />
      <KpiCard
        label="AOA Revenue"
        value={summary ? formatCurrency(summary.total_merchant_revenue) : '—'}
      />
      <KpiCard
        label="AOA Margin"
        value="N/A"
        subtext="coming soon — supplier cost tracking pending"
      />
      <KpiCard
        label="Shopify MRR"
        value={summary ? formatCurrency(summary.mrr_shopify_billing) : '—'}
      />
    </div>
  )
}
