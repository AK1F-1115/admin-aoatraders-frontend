'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { usePricePlans, useDeletePricePlan } from '@/lib/queries/usePricePlans'
import PricePlanTable from './PricePlanTable'
import PricePlanEditModal from './PricePlanEditModal'
import PricePlanCreateModal from './PricePlanCreateModal'
import ConfirmModal from '@/components/common/ConfirmModal'
import type { PricePlan } from '@/types/price-plan.types'

interface PricePlanClientProps {
  initialData?: PricePlan[]
}

export default function PricePlanClient({ initialData }: PricePlanClientProps) {
  const [editingPlan, setEditingPlan] = useState<PricePlan | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [deletingPlan, setDeletingPlan] = useState<PricePlan | null>(null)

  const { data: plans = [], isLoading, isError } = usePricePlans(initialData)
  const { mutateAsync: deletePlan, isPending: isDeleting } = useDeletePricePlan()

  async function handleConfirmDelete() {
    if (!deletingPlan) return
    try {
      await deletePlan(deletingPlan.id)
      toast.success(`"${deletingPlan.name}" deactivated.`)
      setDeletingPlan(null)
    } catch {
      toast.error('Failed to deactivate plan. Please try again.')
    }
  }

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
        onCreate={() => setIsCreating(true)}
        onDelete={(plan) => setDeletingPlan(plan)}
      />

      <PricePlanEditModal
        plan={editingPlan}
        onClose={() => setEditingPlan(null)}
      />

      <PricePlanCreateModal
        open={isCreating}
        onClose={() => setIsCreating(false)}
      />

      <ConfirmModal
        open={!!deletingPlan}
        title="Deactivate price plan?"
        description={`"${deletingPlan?.name}" will be marked inactive and can no longer be assigned to stores. Stores already on this plan are not affected.`}
        confirmText="Deactivate"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingPlan(null)}
      />
    </div>
  )
}
