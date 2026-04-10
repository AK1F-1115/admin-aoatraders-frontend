'use server'

import { revalidatePath } from 'next/cache'
import { apiRequest } from '@/lib/api'
import type { OrderStatus } from '@/types/api.types'

/**
 * PATCH /admin/orders/{id}/status
 *
 * Updates order status. Passing `cancelled` triggers a full Stripe refund to the merchant.
 * Passing `shipped` requires a tracking_number.
 */
export async function updateOrderStatus(
  id: number,
  status: OrderStatus,
  trackingNumber?: string,
): Promise<void> {
  await apiRequest<void>(`/admin/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({
      status,
      ...(trackingNumber ? { tracking_number: trackingNumber } : {}),
    }),
  })
  revalidatePath(`/orders/${id}`)
  revalidatePath('/orders')
}
