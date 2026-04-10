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
 * Normalise list response — mirrors the dashboard's multi-shape handling.
 * API may return: Order[], { items, total }, { data, total }, { orders, total }
 */
function normalise(raw: unknown): { items: Order[]; total: number } {
  if (Array.isArray(raw)) {
    return { items: raw as Order[], total: (raw as Order[]).length }
  }
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    // Try every key the backend has been observed to use
    const items: Order[] =
      (Array.isArray(obj.items) ? obj.items : null) ??
      (Array.isArray(obj.data) ? obj.data : null) ??
      (Array.isArray(obj.orders) ? obj.orders : null) ??
      []
    const total = typeof obj.total === 'number' ? obj.total : items.length
    return { items, total }
  }
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
