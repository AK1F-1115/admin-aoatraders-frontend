'use client'

import { useQuery } from '@tanstack/react-query'
import { clientApiRequest } from '@/lib/clientApi'
import type { BillingPlan } from '@/types/billing.types'
import type { Store } from '@/types/store.types'

/**
 * GET /billing/plans — public endpoint, no auth enforced on the route itself
 * but the proxy will still forward the admin token.
 * Plans are stable; 5-minute stale time.
 */
export function useBillingPlans() {
  return useQuery({
    queryKey: ['billing', 'plans'],
    queryFn: async () => {
      const raw = await clientApiRequest<unknown>('/billing/plans')
      // API may return { plans: [...] } or a plain array
      if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        const obj = raw as Record<string, unknown>
        if (Array.isArray(obj.plans)) return obj.plans as BillingPlan[]
      }
      if (Array.isArray(raw)) return raw as BillingPlan[]
      return [] as BillingPlan[]
    },
    staleTime: 300_000,
  })
}

/**
 * GET /admin/stores (all, per_page=200) — used for the billing store table.
 * Reuses the same endpoint as the stores page but with a distinct query key
 * so billing can invalidate independently.
 */
export function useStoresForBilling() {
  return useQuery({
    queryKey: ['billing', 'stores'],
    queryFn: async () => {
      const raw = await clientApiRequest<unknown>('/admin/stores?per_page=200')
      if (Array.isArray(raw)) return raw as Store[]
      if (raw && typeof raw === 'object') {
        const obj = raw as Record<string, unknown>
        if (Array.isArray(obj.items)) return obj.items as Store[]
        if (Array.isArray(obj.stores)) return obj.stores as Store[]
      }
      return [] as Store[]
    },
    staleTime: 60_000,
  })
}
