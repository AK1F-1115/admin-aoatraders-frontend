'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PricePlan } from '@/types/price-plan.types'

/** Format a decimal markup value as a display percentage string, e.g. 0.35 → "35.00%" */
function fmtPct(val: number | undefined | null): string {
  if (val == null || isNaN(val as number)) return '—'
  return `${(val * 100).toFixed(2)}%`
}

interface PricePlanTableProps {
  plans: PricePlan[]
  isLoading: boolean
  onEdit: (plan: PricePlan) => void
  onCreate: () => void
  onDelete: (plan: PricePlan) => void
}

export default function PricePlanTable({
  plans,
  isLoading,
  onEdit,
  onCreate,
  onDelete,
}: PricePlanTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      {/* Table header actions */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-xs text-muted-foreground">{plans.length} plan{plans.length !== 1 ? 's' : ''}</p>
        <Button size="sm" onClick={onCreate}>
          + Create Plan
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-160 text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Plan Name</th>
              <th className="px-4 py-3">Status</th>
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
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 w-20 rounded bg-muted" />
                    </td>
                  ))}
                </tr>
              ))}

            {!isLoading && plans.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No price plans found.
                </td>
              </tr>
            )}

            {!isLoading &&
              plans.map((plan) => {
                const canDelete = plan.store_count === 0
                const deleteTitle = canDelete
                  ? `Deactivate "${plan.name}"`
                  : `Re-assign ${plan.store_count} store${plan.store_count !== 1 ? 's' : ''} first`

                return (
                  <tr key={plan.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{plan.name}</td>
                    <td className="px-4 py-3">
                      {plan.active ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{fmtPct(plan.aoa_markup_pct_retail)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{fmtPct(plan.aoa_markup_pct_vds)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{fmtPct(plan.aoa_markup_pct_wholesale)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {plan.store_count}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onEdit(plan)}
                          title={`Edit ${plan.name}`}
                          aria-label={`Edit ${plan.name}`}
                        >
                          <Pencil />
                        </Button>
                        <span title={deleteTitle}>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => canDelete && onDelete(plan)}
                            disabled={!canDelete || !plan.active}
                            aria-label={deleteTitle}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 />
                          </Button>
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
