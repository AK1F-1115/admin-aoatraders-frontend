'use client'

import { useMemo } from 'react'
import { useBillingPlans, useStoresForBilling } from '@/lib/queries/useBilling'
import BillingKpiCards, { computeBillingStats } from './BillingKpiCards'
import PlanDistributionChart from './PlanDistributionChart'
import PlansReferenceTable from './PlansReferenceTable'
import StoreBillingTable from './StoreBillingTable'

/**
 * Client wrapper for the /billing page.
 * Fetches plans + stores in parallel, computes KPI stats, and renders
 * all billing sub-components.
 */
export default function BillingClient() {
  const {
    data: plans = [],
    isLoading: plansLoading,
    isError: plansError,
  } = useBillingPlans()

  const {
    data: stores = [],
    isLoading: storesLoading,
    isError: storesError,
  } = useStoresForBilling()

  const isLoading = plansLoading || storesLoading

  // Build a planId → price map once plans are loaded
  const planPrices = useMemo(
    () => Object.fromEntries(plans.map((p) => [p.id, Number(p.price_usd)])),
    [plans],
  )

  const kpiStats = useMemo(
    () =>
      computeBillingStats(
        stores.map((s) => ({
          active: s.active,
          subscription_plan_slug: s.subscription_plan_slug,
          subscription_plan_id: s.subscription_plan_id,
          subscription_status: s.subscription_status,
        })),
        planPrices,
      ),
    [stores, planPrices],
  )

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <h1 className="text-2xl font-bold tracking-tight">Billing</h1>

      {(plansError || storesError) && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {plansError && <p>Failed to load billing plans.</p>}
          {storesError && <p>Failed to load store data.</p>}
        </div>
      )}

      {/* KPI row */}
      <BillingKpiCards stats={kpiStats} isLoading={isLoading} />

      {/* Chart + Plans side-by-side on wide screens */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PlanDistributionChart stores={stores} plans={plans} />
        <PlansReferenceTable plans={plans} stores={stores} />
      </div>

      {/* Store billing table */}
      <StoreBillingTable stores={stores} plans={plans} isLoading={storesLoading} />
    </div>
  )
}
