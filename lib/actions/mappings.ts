'use server'

import { revalidatePath } from 'next/cache'
import { apiRequest } from '@/lib/api'
import type { Mapping, UpdateMappingBody } from '@/types/mapping.types'

/**
 * PATCH /admin/mappings/{id}
 * Updates the active state or variant_ids for a category/brand mapping.
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
