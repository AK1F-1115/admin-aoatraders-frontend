'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientApiRequest } from '@/lib/clientApi'
import { createPricePlan, updatePricePlan, deletePricePlan } from '@/lib/actions/pricePlans'
import type { PricePlan, CreatePricePlanBody, UpdatePricePlanBody } from '@/types/price-plan.types'

function normalisePlans(raw: unknown): PricePlan[] {
  let items: unknown[] = []
  if (Array.isArray(raw)) items = raw
  else if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    if (Array.isArray(obj.plans)) items = obj.plans
    else if (Array.isArray(obj.items)) items = obj.items
  }
  return items as PricePlan[]
}

/** GET /admin/price-plans — all plans (including inactive). */
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

/** GET /admin/price-plans?active_only=true — for plan assignment dropdowns. */
export function useActivePricePlans() {
  return useQuery({
    queryKey: ['price-plans', 'active'],
    queryFn: async () => {
      const raw = await clientApiRequest<unknown>('/admin/price-plans?active_only=true')
      return normalisePlans(raw)
    },
    staleTime: 60_000,
  })
}

/** Mutation: POST /admin/price-plans */
export function useCreatePricePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreatePricePlanBody) => createPricePlan(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-plans'] })
    },
  })
}

/** Mutation: PATCH /admin/price-plans/{id} */
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

/** Mutation: DELETE /admin/price-plans/{id} */
export function useDeletePricePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deletePricePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-plans'] })
    },
  })
}
