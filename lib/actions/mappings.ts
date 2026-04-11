'use server'

import { revalidatePath } from 'next/cache'
import { apiRequest } from '@/lib/api'
import type { Mapping, UpdateMappingBody } from '@/types/mapping.types'

/**
 * PATCH /admin/mappings/{id}
 * Toggles the active state for a supplier SKU → Shopify variant mapping.
 */
export async function updateMapping(
  id: number,
  body: UpdateMappingBody,
): Promise<Mapping> {
  const updated = await apiRequest<Mapping>(`/admin/mappings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  revalidatePath('/mappings')
  return updated
}
