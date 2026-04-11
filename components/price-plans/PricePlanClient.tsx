'use client'

import { useState } from 'react'
import { usePricePlans } from '@/lib/queries/usePricePlans'
import PricePlanTable from './PricePlanTable'
import PricePlanEditModal from './PricePlanEditModal'
import type { PricePlan } from '@/types/price-plan.types'

interface PricePlanClientProps {
  initialData?: PricePlan[]
}

export default function PricePlanClient({ initialData }: PricePlanClientProps) {
  const [editingPlan, setEditingPlan] = useState<PricePlan | null>(null)

  const { data: plans = [], isLoading, isError } = usePricePlans(initialData)

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Price Plans</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AOA internal markup tiers applied to product pricing across plan categories.
        </p>
      </div>

      {isError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Failed to load price plans. Refresh to retry.
        </div>
      )}

      <PricePlanTable
        plans={plans}
        isLoading={isLoading}
        onEdit={(plan) => setEditingPlan(plan)}
      />

      <PricePlanEditModal
        plan={editingPlan}
        onClose={() => setEditingPlan(null)}
      />
    </div>
  )
}
