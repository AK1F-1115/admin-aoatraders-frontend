'use server'

import { apiRequest } from '@/lib/api'
import type { PatchConfigResponse } from '@/types/system.types'

/**
 * PATCH /admin/system/config
 * Writes allowlisted keys to the server .env file.
 * No revalidatePath needed — caller invalidates ['system', 'config'] via queryClient.
 */
export async function patchSystemConfig(
  body: Record<string, string>,
): Promise<PatchConfigResponse> {
  return apiRequest<PatchConfigResponse>('/admin/system/config', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}
