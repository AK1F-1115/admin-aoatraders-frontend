'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientApiRequest } from '@/lib/clientApi'
import { updatePricePlan } from '@/lib/actions/pricePlans'
import type { PricePlan, UpdatePricePlanBody } from '@/types/price-plan.types'

/**
 * Normalise the API response — may return a plain array or { plans: [...] }.
 */
function normalisePlans(raw: unknown): PricePlan[] {
  if (Array.isArray(raw)) return raw as PricePlan[]
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    if (Array.isArray(obj.plans)) return obj.plans as PricePlan[]
    if (Array.isArray(obj.items)) return obj.items as PricePlan[]
  }
  return []
}

/**
 * GET /admin/price-plans
 * Returns all AOA internal price plan tiers.
 */
export function usePricePlans(initialData?: PricePlan[]) {
  return useQuery({
    queryKey: ['price-plans'],
    queryFn: async () => {
      const raw = await clientApiRequest<unknown>('/admin/price-plans')
      return normalisePlans(raw)
    },
    initialData,
    staleTime: 60_000,
  })
}

/**
 * Mutation: PATCH /admin/price-plans/{id}
 * Calls the server action and invalidates the query cache on success.
 */
export function useUpdatePricePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdatePricePlanBody }) =>
      updatePricePlan(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-plans'] })
    },
  })
}
