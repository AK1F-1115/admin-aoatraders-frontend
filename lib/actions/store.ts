'use server'

import { revalidatePath } from 'next/cache'
import { apiRequest } from '@/lib/api'
import type { Store } from '@/types/store.types'

/**
 * PATCH /admin/stores/{id}
 * Updates any subset of store fields (markups, active, sync_config).
 */
export async function updateStore(id: number, body: Record<string, unknown>): Promise<Store> {
  const store = await apiRequest<Store>(`/admin/stores/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  revalidatePath(`/stores/${id}`)
  revalidatePath('/stores')
  return store
}

/**
 * POST /admin/stores/{id}/assign-plan
 */
export async function assignPlan(storeId: number, planId: number): Promise<void> {
  await apiRequest<void>(`/admin/stores/${storeId}/assign-plan`, {
    method: 'POST',
    body: JSON.stringify({ plan_id: planId }),
  })
  revalidatePath(`/stores/${storeId}`)
  revalidatePath('/stores')
  revalidatePath('/billing')
}

// ── Per-store sync actions ──────────────────────────────────────────────────

export async function syncRetail(storeId: number): Promise<void> {
  await apiRequest<void>(`/admin/stores/${storeId}/sync/retail`, { method: 'POST' })
}

export async function syncVds(storeId: number): Promise<void> {
  await apiRequest<void>(`/admin/stores/${storeId}/sync/vds`, { method: 'POST' })
}

export async function syncPrices(storeId: number): Promise<void> {
  await apiRequest<void>(`/admin/stores/${storeId}/sync/prices`, { method: 'POST' })
}

export async function syncInventory(storeId: number): Promise<void> {
  await apiRequest<void>(`/admin/stores/${storeId}/sync/inventory`, { method: 'POST' })
}

export async function syncStatus(storeId: number): Promise<void> {
  await apiRequest<void>(`/admin/stores/${storeId}/sync/status`, { method: 'POST' })
}

export async function bootstrapCollections(storeId: number): Promise<void> {
  await apiRequest<void>(`/admin/stores/${storeId}/bootstrap-collections`, { method: 'POST' })
}

export async function registerWebhooks(storeId: number): Promise<void> {
  await apiRequest<void>(`/admin/stores/${storeId}/register-webhooks`, { method: 'POST' })
}

export async function resetShipping(storeId: number): Promise<void> {
  await apiRequest<void>(`/admin/stores/${storeId}/reset-shipping`, { method: 'POST' })
}

/**
 * Deactivate a store — sets active=false.
 */
export async function deactivateStore(storeId: number): Promise<void> {
  await apiRequest<void>(`/admin/stores/${storeId}`, {
    method: 'PATCH',
    body: JSON.stringify({ active: false }),
  })
  revalidatePath(`/stores/${storeId}`)
  revalidatePath('/stores')
}
