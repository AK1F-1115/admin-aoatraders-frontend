import { notFound, redirect } from 'next/navigation'
import { apiRequest, UnauthorizedError } from '@/lib/api'
import type { Store } from '@/types/store.types'
import type { BillingPlan } from '@/types/billing.types'
import StoreDetailClient from '@/components/stores/StoreDetailClient'

interface StoreDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function StoreDetailPage({ params }: StoreDetailPageProps) {
  const { id } = await params
  const storeId = Number(id)

  if (isNaN(storeId)) notFound()

  const [storeResult, plansResult] = await Promise.allSettled([
    apiRequest<Store>(`/admin/stores/${storeId}`),
    apiRequest<BillingPlan[]>('/billing/plans'),
  ])

  if (storeResult.status === 'rejected') {
    if (storeResult.reason instanceof UnauthorizedError) redirect('/auth/login')
    notFound()
  }

  const store = storeResult.value
  const plans = plansResult.status === 'fulfilled' ? plansResult.value : []

  return <StoreDetailClient store={store} plans={plans} />
}
