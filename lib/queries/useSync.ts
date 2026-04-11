'use client'

import { useQuery } from '@tanstack/react-query'
import { clientApiRequest } from '@/lib/clientApi'
import type { SyncSummaryRow, SyncStatusResponse } from '@/types/sync.types'

/**
 * GET /admin/sync/summary — one row per job_type, latest run only.
 * Polled every 30 seconds so the page stays live.
 */
export function useSyncSummary() {
  return useQuery({
    queryKey: ['sync', 'summary'],
    queryFn: async () => {
      const raw = await clientApiRequest<unknown>('/admin/sync/summary')
      // API may return SyncSummaryRow[] directly or { syncs: [...] }
      if (Array.isArray(raw)) return raw as SyncSummaryRow[]
      if (raw && typeof raw === 'object') {
        const obj = raw as Record<string, unknown>
        if (Array.isArray(obj.syncs)) return obj.syncs as SyncSummaryRow[]
      }
      return [] as SyncSummaryRow[]
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}

export interface SyncHistoryFilters {
  job_type?: string
  store_id?: number
  page?: number
}

/**
 * GET /admin/sync/status — paginated full history.
 * Used for drill-down history tables.
 */
export function useSyncHistory(filters: SyncHistoryFilters = {}) {
  const params = new URLSearchParams()
  if (filters.job_type) params.set('job_type', filters.job_type)
  if (filters.store_id != null) params.set('store_id', String(filters.store_id))
  if (filters.page != null) params.set('page', String(filters.page))
  const qs = params.toString() ? `?${params.toString()}` : ''

  return useQuery({
    queryKey: ['sync', 'history', filters],
    queryFn: async () => {
      const raw = await clientApiRequest<unknown>(`/admin/sync/status${qs}`)
      if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        const obj = raw as SyncStatusResponse & Record<string, unknown>
        return obj
      }
      return raw as SyncStatusResponse
    },
    staleTime: 30_000,
  })
}
