/**
 * /price-plans — AOA Internal Price Plan Tiers
 *
 * Server Component: fetches plan data server-side for fast initial render.
 * PricePlanClient hydrates with TanStack Query for live updates.
 */
import { redirect } from 'next/navigation'
import { apiRequest, UnauthorizedError } from '@/lib/api'
import type { PricePlan } from '@/types/price-plan.types'
import PricePlanClient from '@/components/price-plans/PricePlanClient'

type Raw = Record<string, unknown>

function pickNum(obj: Raw, ...keys: string[]): number | undefined {
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === 'number') return v
    if (typeof v === 'string' && v !== '' && !isNaN(Number(v))) return Number(v)
  }
  return undefined
}

function normalisePricePlanItem(raw: Raw): PricePlan {
  return {
    id: raw.id as number,
    name: (raw.name ?? raw.plan_name ?? '') as string,
    markup_retail: pickNum(raw, 'markup_retail', 'aoa_markup_pct_retail', 'retail_markup_pct', 'markup_pct_retail', 'retail_pct', 'retail_markup', 'aoa_retail_markup', 'aoa_markup_retail') ?? 0,
    markup_vds: pickNum(raw, 'markup_vds', 'aoa_markup_pct_vds', 'vds_markup_pct', 'markup_pct_vds', 'vds_pct', 'vds_markup', 'aoa_vds_markup', 'aoa_markup_vds') ?? 0,
    markup_wholesale: pickNum(raw, 'markup_wholesale', 'aoa_markup_pct_wholesale', 'wholesale_markup_pct', 'markup_pct_wholesale', 'wholesale_pct', 'wholesale_markup', 'aoa_wholesale_markup', 'aoa_markup_wholesale') ?? 0,
    store_count: pickNum(raw, 'store_count', 'num_stores', 'stores_count', 'stores_on_plan', 'active_stores') ?? 0,
  }
}

function normalisePlans(raw: unknown): PricePlan[] {
  let items: unknown[] = []
  if (Array.isArray(raw)) items = raw
  else if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    if (Array.isArray(obj.plans)) items = obj.plans
    else if (Array.isArray(obj.items)) items = obj.items
  }
  return items.map((item) => normalisePricePlanItem(item as Raw))
}

export default async function PricePlansPage() {
  let initialData: PricePlan[] | undefined

  try {
    const raw = await apiRequest<unknown>('/admin/price-plans')
    initialData = normalisePlans(raw)
  } catch (err) {
    if (err instanceof UnauthorizedError) redirect('/auth/reset')
    // Non-fatal: client will fetch on mount
  }

  return <PricePlanClient initialData={initialData} />
}
