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

/** Normalise list response \u2014 API may return Order[] or { items, total } */
function normalise(raw: Order[] | { items?: Order[]; total?: number }) {
  const items = Array.isArray(raw) ? raw : (raw.items ?? [])
  const total = Array.isArray(raw) ? raw.length : (raw.total ?? items.length)
  return { items, total }
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
      const raw = await clientApiRequest<Order[] | { items?: Order[]; total?: number }>(
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
