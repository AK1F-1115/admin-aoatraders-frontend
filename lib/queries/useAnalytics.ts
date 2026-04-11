'use client'

import { useQuery } from '@tanstack/react-query'
import { clientApiRequest } from '@/lib/clientApi'
import { format, differenceInDays } from 'date-fns'
import type {
  AnalyticsSummary,
  StoreAnalytics,
  OrdersOverTime,
  TopProduct,
} from '@/types/analytics.types'

export interface PeriodParams {
  period?: string // YYYY-MM
  start?: string  // YYYY-MM-DD
  end?: string    // YYYY-MM-DD
}

export function buildPeriodQS(params: PeriodParams): string {
  if (params.start && params.end) return `start=${params.start}&end=${params.end}`
  if (params.period) return `period=${params.period}`
  return `period=${format(new Date(), 'yyyy-MM')}`
}

export function chooseGranularity(start: string, end: string): 'day' | 'week' | 'month' {
  const days = differenceInDays(new Date(end), new Date(start))
  if (days <= 31) return 'day'
  if (days <= 90) return 'week'
  return 'month'
}

export function useAnalyticsSummary(params: PeriodParams) {
  const qs = buildPeriodQS(params)
  return useQuery({
    queryKey: ['analytics', 'summary', qs],
    queryFn: () => clientApiRequest<AnalyticsSummary>(`/admin/analytics/summary?${qs}`),
    staleTime: 5 * 60_000,
  })
}

export function useAnalyticsStores(params: PeriodParams) {
  const qs = buildPeriodQS(params)
  return useQuery({
    queryKey: ['analytics', 'stores', qs],
    queryFn: async () => {
      const raw = await clientApiRequest<unknown>(`/admin/analytics/stores?${qs}`)
      if (Array.isArray(raw)) return raw as StoreAnalytics[]
      if (raw && typeof raw === 'object') {
        const obj = raw as Record<string, unknown>
        for (const key of ['stores', 'items', 'data']) {
          if (Array.isArray(obj[key])) return obj[key] as StoreAnalytics[]
        }
      }
      return []
    },
    staleTime: 5 * 60_000,
  })
}

export function useOrdersOverTime(
  start: string,
  end: string,
  granularity: 'day' | 'week' | 'month',
) {
  return useQuery({
    queryKey: ['analytics', 'orders-over-time', start, end, granularity],
    queryFn: () =>
      clientApiRequest<OrdersOverTime>(
        `/admin/analytics/orders-over-time?start=${start}&end=${end}&granularity=${granularity}`,
      ),
    staleTime: 5 * 60_000,
  })
}

export function useTopProducts(params: PeriodParams, limit = 20) {
  const qs = buildPeriodQS(params)
  return useQuery({
    queryKey: ['analytics', 'top-products', qs, limit],
    queryFn: async () => {
      const raw = await clientApiRequest<unknown>(
        `/admin/analytics/top-products?${qs}&limit=${limit}`,
      )
      if (Array.isArray(raw)) return raw as TopProduct[]
      if (raw && typeof raw === 'object') {
        const obj = raw as Record<string, unknown>
        for (const key of ['products', 'items', 'data']) {
          if (Array.isArray(obj[key])) return obj[key] as TopProduct[]
        }
      }
      return []
    },
    staleTime: 5 * 60_000,
  })
}
