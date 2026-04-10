'use client'

import { useQuery } from '@tanstack/react-query'
import { clientApiRequest } from '@/lib/clientApi'
import type { StoreCatalogSummary } from '@/types/store.types'

/**
 * Lazy-loads GET /admin/stores/{id}/catalog-summary.
 * staleTime: 60s — read-only snapshot, fine to cache briefly.
 */
export function useStoreCatalogSummary(storeId: number) {
  return useQuery({
    queryKey: ['store-catalog-summary', storeId],
    queryFn: () => clientApiRequest<StoreCatalogSummary>(`/admin/stores/${storeId}/catalog-summary`),
    staleTime: 60_000,
  })
}
