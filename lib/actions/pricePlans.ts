'use server'

import { revalidatePath } from 'next/cache'
import { apiRequest } from '@/lib/api'
import type { PricePlan, CreatePricePlanBody, UpdatePricePlanBody } from '@/types/price-plan.types'

/**
 * POST /admin/price-plans
 * Creates a new AOA price plan tier. Returns 201.
 */
export async function createPricePlan(body: CreatePricePlanBody): Promise<PricePlan> {
  const plan = await apiRequest<PricePlan>('/admin/price-plans', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  revalidatePath('/price-plans')
  return plan
}

/**
 * PATCH /admin/price-plans/{id}
 * Updates the AOA markup percentages / name / active state for a price plan.
 * All markup values must be sent as decimals (0.35 = 35%).
 */
export async function updatePricePlan(
  id: number,
  body: UpdatePricePlanBody,
): Promise<PricePlan> {
  const updated = await apiRequest<PricePlan>(`/admin/price-plans/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  revalidatePath('/price-plans')
  return updated
}

/**
 * DELETE /admin/price-plans/{id}
 * Soft-deactivates a plan. Returns 409 if stores are still assigned.
 */
export async function deletePricePlan(id: number): Promise<void> {
  await apiRequest<void>(`/admin/price-plans/${id}`, { method: 'DELETE' })
  revalidatePath('/price-plans')
}
