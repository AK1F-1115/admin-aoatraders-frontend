'use server'

import { apiRequest } from '@/lib/api'

/**
 * Trigger a full Essendant (ICAPS) product ingest.
 * POST /admin/sync/essendant/run
 */
export async function triggerEssendantSync(): Promise<void> {
  await apiRequest<void>('/admin/sync/essendant/run', { method: 'POST' })
}

/**
 * Trigger a Shopify push sync for all active stores.
 * POST /admin/sync/shopify/run
 */
export async function triggerShopifySync(): Promise<void> {
  await apiRequest<void>('/admin/sync/shopify/run', { method: 'POST' })
}
