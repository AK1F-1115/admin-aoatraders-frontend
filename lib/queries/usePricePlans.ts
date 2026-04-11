'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientApiRequest } from '@/lib/clientApi'
import { updatePricePlan } from '@/lib/actions/pricePlans'
import type { PricePlan, UpdatePricePlanBody } from '@/types/price-plan.types'

type Raw = Record<string, unknown>

/** Pick the first key that exists and is a number, else undefined */
function pickNum(obj: Raw, ...keys: string[]): number | undefined {
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === 'number') return v
    if (typeof v === 'string' && v !== '' && !isNaN(Number(v))) return Number(v)
  }
  return undefined
}

/**
 * Map a raw API row to a typed PricePlan.
 * Tries every known field-name variant — the backend may use any of these.
 */
function normalisePricePlanItem(raw: Raw): PricePlan {
  return {
    id: raw.id as number,
    name: (raw.name ?? raw.plan_name ?? '') as string,
    // Try every likely markup field name:
    // markup_retail / aoa_markup_pct_retail / retail_markup_pct / markup_pct_retail / retail_pct / retail_markup
    markup_retail: pickNum(
      raw,
      'markup_retail',
      'aoa_markup_pct_retail',
      'retail_markup_pct',
      'markup_pct_retail',
      'retail_pct',
      'retail_markup',
      'aoa_retail_markup',
      'aoa_markup_retail',
    ) ?? 0,
    markup_vds: pickNum(
      raw,
      'markup_vds',
      'aoa_markup_pct_vds',
      'vds_markup_pct',
      'markup_pct_vds',
      'vds_pct',
      'vds_markup',
      'aoa_vds_markup',
      'aoa_markup_vds',
    ) ?? 0,
    markup_wholesale: pickNum(
      raw,
      'markup_wholesale',
      'aoa_markup_pct_wholesale',
      'wholesale_markup_pct',
      'markup_pct_wholesale',
      'wholesale_pct',
      'wholesale_markup',
      'aoa_wholesale_markup',
      'aoa_markup_wholesale',
    ) ?? 0,
    store_count: pickNum(
      raw,
      'store_count',
      'num_stores',
      'stores_count',
      'stores_on_plan',
      'active_stores',
    ) ?? 0,
  }
}

/**
 * Normalise the API response — may return a plain array or { plans: [...] }.
 */
function normalisePlans(raw: unknown): PricePlan[] {
  let items: unknown[] = []
  if (Array.isArray(raw)) {
    items = raw
  } else if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    if (Array.isArray(obj.plans)) items = obj.plans
    else if (Array.isArray(obj.items)) items = obj.items
  }
  return items.map((item) => normalisePricePlanItem(item as Raw))
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
      const plans = normalisePlans(raw)
      // DEBUG: log the first raw item so we can confirm actual field names
      if (Array.isArray(raw) && raw.length > 0) {
        console.log('[price-plans] raw first item:', raw[0])
      } else if (raw && typeof raw === 'object') {
        const arr = (raw as Record<string, unknown>).plans ?? (raw as Record<string, unknown>).items
        if (Array.isArray(arr) && arr.length > 0) console.log('[price-plans] raw first item:', arr[0])
      }
      return plans
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
