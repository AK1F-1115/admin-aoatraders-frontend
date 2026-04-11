'use client'

import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PricePlan } from '@/types/price-plan.types'

/** Format a decimal markup value as a display percentage string, e.g. 0.35 → "35.00%" */
function fmtPct(val: number): string {
  return `${(val * 100).toFixed(2)}%`
}

interface PricePlanTableProps {
  plans: PricePlan[]
  isLoading: boolean
  onEdit: (plan: PricePlan) => void
}

export default function PricePlanTable({ plans, isLoading, onEdit }: PricePlanTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Plan Name</th>
              <th className="px-4 py-3 text-right">AOA Markup Retail %</th>
              <th className="px-4 py-3 text-right">AOA Markup VDS %</th>
              <th className="px-4 py-3 text-right">AOA Markup Wholesale %</th>
              <th className="px-4 py-3 text-right">Stores on Plan</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3">
                    <div className="h-4 w-32 rounded bg-muted" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="ml-auto h-4 w-16 rounded bg-muted" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="ml-auto h-4 w-16 rounded bg-muted" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="ml-auto h-4 w-16 rounded bg-muted" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="ml-auto h-4 w-8 rounded bg-muted" />
                  </td>
                  <td className="px-4 py-3" />
                </tr>
              ))}

            {!isLoading && plans.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No price plans found.
                </td>
              </tr>
            )}

            {!isLoading &&
              plans.map((plan) => (
                <tr
                  key={plan.id}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-medium">{plan.name}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmtPct(plan.markup_retail)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmtPct(plan.markup_vds)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmtPct(plan.markup_wholesale)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {plan.store_count}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onEdit(plan)}
                      title={`Edit ${plan.name}`}
                      aria-label={`Edit ${plan.name}`}
                    >
                      <Pencil />
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
