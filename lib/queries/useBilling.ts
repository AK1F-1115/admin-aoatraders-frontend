'use client'

import { useQuery } from '@tanstack/react-query'
import { clientApiRequest } from '@/lib/clientApi'
import type { BillingPlan } from '@/types/billing.types'
import type { Store } from '@/types/store.types'

/**
 * GET /billing/plans
 *
 * This endpoint lives at API_BASE/billing/plans (no /admin/ prefix), so we
 * route through /api/proxy/* instead of /api/admin/* to avoid the automatic
 * /admin/ prepend that clientApiRequest applies.
 *
 * Plans are stable; 5-minute stale time.
 */
async function fetchBillingPlans(): Promise<BillingPlan[]> {
  const res = await fetch('/api/proxy/billing/plans', {
    headers: { 'Content-Type': 'application/json' },
  })
  if (res.status === 401) {
    window.location.href = '/auth/reset'
    throw new Error('Unauthorized')
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { detail?: string }).detail ?? `HTTP ${res.status}`)
  }
  const raw: unknown = await res.json()
  // API may return { plans: [...] } or a plain array
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>
    if (Array.isArray(obj.plans)) return obj.plans as BillingPlan[]
  }
  if (Array.isArray(raw)) return raw as BillingPlan[]
  return []
}

export function useBillingPlans() {
  return useQuery({
    queryKey: ['billing', 'plans'],
    queryFn: fetchBillingPlans,
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
