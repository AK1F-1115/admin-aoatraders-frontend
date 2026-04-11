import type { BillingPlan } from '@/types/billing.types'
import type { Store } from '@/types/store.types'

interface PlansReferenceTableProps {
  plans: BillingPlan[]
  stores: Store[]
}

function storesOnPlan(stores: Store[], planId: number): number {
  return stores.filter((s) => s.active && s.subscription_plan_id === planId).length
}

export default function PlansReferenceTable({ plans, stores }: PlansReferenceTableProps) {
  const ordered = [...plans].sort((a, b) => a.id - b.id)

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Available Plans
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Slug</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                Price / mo
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                SKU Limit
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                Trial Days
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                Stores on Plan
              </th>
            </tr>
          </thead>
          <tbody>
            {ordered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No plan data available.
                </td>
              </tr>
            ) : (
              ordered.map((plan) => (
                <tr
                  key={plan.id}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{plan.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {plan.slug}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {plan.price_usd === 0
                      ? 'Free'
                      : `$${plan.price_usd.toFixed(2)}`}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {plan.sku_limit == null ? '∞' : plan.sku_limit.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">{plan.trial_days}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {storesOnPlan(stores, plan.id)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
