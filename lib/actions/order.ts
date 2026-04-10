'use server'

import { revalidatePath } from 'next/cache'
import { apiRequest } from '@/lib/api'
import type { OrderStatus } from '@/types/api.types'
import type { UpdateOrderStatusResponse } from '@/types/order.types'

/**
 * PATCH /admin/orders/{id}/status
 *
 * Returns UpdateOrderStatusResponse so callers can show refund toast messages.
 * Passing `cancelled` on a purchased order triggers a full Stripe refund.
 * Passing `shipped` requires a tracking_number.
 */
export async function updateOrderStatus(
  id: number,
  status: OrderStatus,
  trackingNumber?: string,
): Promise<UpdateOrderStatusResponse> {
  return apiRequest<UpdateOrderStatusResponse>(`/admin/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({
      status,
      ...(trackingNumber ? { tracking_number: trackingNumber } : {}),
    }),
  }).then((result) => {
    revalidatePath(`/orders/${id}`)
    revalidatePath('/orders')
    return result
  })
}
