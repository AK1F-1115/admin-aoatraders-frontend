'use server'

import { revalidatePath } from 'next/cache'
import { apiRequest } from '@/lib/api'
import type { PricePlan, UpdatePricePlanBody } from '@/types/price-plan.types'

/**
 * PATCH /admin/price-plans/{id}
 * Updates the AOA markup percentages for a price plan tier.
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
