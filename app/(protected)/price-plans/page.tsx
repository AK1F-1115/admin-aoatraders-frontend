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
