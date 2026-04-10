import { notFound, redirect } from 'next/navigation'
import { apiRequest, UnauthorizedError } from '@/lib/api'
import type { OrderDetail } from '@/types/order.types'
import OrderDetailClient from '@/components/orders/OrderDetailClient'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  const orderId = Number(id)

  if (isNaN(orderId)) notFound()

  let order: OrderDetail

  try {
    order = await apiRequest<OrderDetail>(`/admin/orders/${orderId}`)
  } catch (err) {
    if (err instanceof UnauthorizedError) redirect('/auth/login')
    notFound()
  }

  return <OrderDetailClient order={order} />
}
