'use client'

import { useQuery } from '@tanstack/react-query'
import { clientApiRequest } from '@/lib/clientApi'
import type { Order, OrderDetail } from '@/types/order.types'

export interface OrdersFilters {
  page?: number
  per_page?: number
  status?: string
  store_id?: number | null
  search?: string
}

/**
 * Normalise list response — API returns { orders: Order[], total, page, per_page, pages }
 * Confirmed from live backend contract (ADMIN_FRONTEND.md §17).
 */
function normalise(raw: unknown): { items: Order[]; total: number } {
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    if (Array.isArray(obj.orders)) {
      return { items: obj.orders as Order[], total: typeof obj.total === 'number' ? obj.total : (obj.orders as unknown[]).length }
    }
  }
  // Fallback: plain array (defensive, shouldn't happen)
  if (Array.isArray(raw)) return { items: raw as Order[], total: (raw as Order[]).length }
  return { items: [], total: 0 }
}

export function useOrders(filters: OrdersFilters = {}) {
  const qs = new URLSearchParams()
  qs.set('per_page', String(filters.per_page ?? 50))
  if (filters.page && filters.page > 1) qs.set('page', String(filters.page))
  if (filters.status) qs.set('status', filters.status)
  if (filters.store_id) qs.set('store_id', String(filters.store_id))
  if (filters.search) qs.set('search', filters.search)

  return useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      const raw = await clientApiRequest<unknown>(
        `/admin/orders?${qs}`,
      )
      return normalise(raw)
    },
    placeholderData: (prev) => prev,
  })
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => clientApiRequest<OrderDetail>(`/admin/orders/${id}`),
  })
}
