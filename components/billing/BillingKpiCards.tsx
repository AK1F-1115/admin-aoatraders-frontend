import { Store, CreditCard, Gift, TrendingUp } from 'lucide-react'
import KpiCard from '@/components/dashboard/KpiCard'
import type { BillingKpiStats } from '@/types/billing.types'

interface BillingKpiCardsProps {
  stats: BillingKpiStats
  isLoading?: boolean
}

const FREE_SLUGS = new Set(['free'])

/**
 * Derives BillingKpiStats from a stores list on the client.
 */
export function computeBillingStats(
  stores: Array<{
    active: boolean
    subscription_plan_slug: string | null
    subscription_plan_id: number | null
    subscription_status: string | null
  }>,
  planPrices: Record<number, number>,
): BillingKpiStats {
  const activeStores = stores.filter((s) => s.active)
  let mrr = 0
  let freeTierCount = 0
  let paidTierCount = 0

  for (const s of activeStores) {
    const isFree =
      !s.subscription_plan_slug || FREE_SLUGS.has(s.subscription_plan_slug)
    if (isFree) {
      freeTierCount++
    } else {
      paidTierCount++
      const price = s.subscription_plan_id != null ? (planPrices[s.subscription_plan_id] ?? 0) : 0
      mrr += price
    }
  }

  return {
    totalActiveStores: activeStores.length,
    mrr,
    freeTierCount,
    paidTierCount,
  }
}

export default function BillingKpiCards({ stats, isLoading }: BillingKpiCardsProps) {
  const fmt = (n: number) => (isLoading ? '…' : String(n))
  const fmtMrr = (n: number) =>
    isLoading
      ? '…'
      : `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Active Stores"
        value={fmt(stats.totalActiveStores)}
        description="Stores with active=true"
        icon={Store}
      />
      <KpiCard
        title="Monthly Recurring Revenue"
        value={fmtMrr(stats.mrr)}
        description="Sum of paid plan prices (active stores)"
        icon={TrendingUp}
      />
      <KpiCard
        title="Free Tier"
        value={fmt(stats.freeTierCount)}
        description="Active stores on the free plan"
        icon={Gift}
      />
      <KpiCard
        title="Paid Plans"
        value={fmt(stats.paidTierCount)}
        description="Active stores on a paid plan"
        icon={CreditCard}
      />
    </div>
  )
}
