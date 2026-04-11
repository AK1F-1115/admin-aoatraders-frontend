'use client'

import { useState, useTransition } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { assignPlan } from '@/lib/actions/store'
import type { Store } from '@/types/store.types'
import type { BillingPlan } from '@/types/billing.types'

interface StoreBillingTableProps {
  stores: Store[]
  plans: BillingPlan[]
  isLoading?: boolean
}

// Plan slug → pill colours (light + dark variants)
const PLAN_BADGE: Record<string, string> = {
  free: 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300',
  starter: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  growth: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  pro: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
}
const DEFAULT_BADGE = 'bg-muted text-muted-foreground'

function planBadgeClass(slug: string | null): string {
  return slug ? (PLAN_BADGE[slug] ?? DEFAULT_BADGE) : DEFAULT_BADGE
}

// ── Confirm-assign dialog ────────────────────────────────────────────────────

interface ConfirmDialogProps {
  store: Store
  targetPlan: BillingPlan
  onConfirm: () => void
  onCancel: () => void
  isPending: boolean
}

function ConfirmDialog({ store, targetPlan, onConfirm, onCancel, isPending }: ConfirmDialogProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-xl">
        <h3 className="text-base font-semibold mb-2">Change Plan</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Assign <span className="font-medium text-foreground">{targetPlan.name}</span> to{' '}
          <span className="font-medium text-foreground">{store.shop_domain}</span>?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="rounded-md px-3 py-2 text-sm border border-border hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="rounded-md px-3 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Row component ────────────────────────────────────────────────────────────

interface RowProps {
  store: Store
  plans: BillingPlan[]
}

function StoreBillingRow({ store, plans }: RowProps) {
  const queryClient = useQueryClient()
  const [selectingPlanId, setSelectingPlanId] = useState<number | null>(null)
  const [pendingPlan, setPendingPlan] = useState<BillingPlan | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const slug = store.subscription_plan_slug ?? null
  const planName = store.subscription_plan_name ?? 'None'

  function handleSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = parseInt(e.target.value, 10)
    if (isNaN(id)) return
    const plan = plans.find((p) => p.id === id)
    if (!plan) return
    setSelectingPlanId(id)
    setPendingPlan(plan)
  }

  function handleConfirm() {
    if (selectingPlanId == null) return
    setError(null)
    startTransition(async () => {
      try {
        await assignPlan(store.id, selectingPlanId)
        // Invalidate billing stores cache so the table refreshes
        await queryClient.invalidateQueries({ queryKey: ['billing', 'stores'] })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to assign plan')
      } finally {
        setSelectingPlanId(null)
        setPendingPlan(null)
      }
    })
  }

  function handleCancel() {
    setSelectingPlanId(null)
    setPendingPlan(null)
  }

  return (
    <>
      <tr className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
        <td className="px-4 py-3 font-mono text-xs">{store.shop_domain}</td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${planBadgeClass(slug)}`}
          >
            {planName}
          </span>
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              store.active
                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
            }`}
          >
            {store.active ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td className="px-4 py-3 text-muted-foreground text-xs">
          {store.subscription_status ?? '—'}
        </td>
        <td className="px-4 py-3">
          <select
            value=""
            onChange={handleSelect}
            disabled={isPending || plans.length === 0}
            aria-label={`Change plan for ${store.shop_domain}`}
            className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          >
            <option value="" disabled>
              Change plan…
            </option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {Number(p.price_usd) === 0 ? ' (Free)' : ` ($${Number(p.price_usd).toFixed(2)}/mo)`}
              </option>
            ))}
          </select>
          {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </td>
      </tr>

      {pendingPlan && (
        <ConfirmDialog
          store={store}
          targetPlan={pendingPlan}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          isPending={isPending}
        />
      )}
    </>
  )
}

// ── Table ────────────────────────────────────────────────────────────────────

export default function StoreBillingTable({ stores, plans, isLoading }: StoreBillingTableProps) {
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Store Billing
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Domain</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Sub. Status
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-muted animate-pulse rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : stores.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No stores found.
                </td>
              </tr>
            ) : (
              stores.map((store) => (
                <StoreBillingRow key={store.id} store={store} plans={plans} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
