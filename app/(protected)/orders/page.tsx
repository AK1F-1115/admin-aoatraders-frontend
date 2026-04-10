import OrdersClient from '@/components/orders/OrdersClient'

/**
 * /orders \u2014 Order Queue
 * Client-side filtering/pagination handled by OrdersClient.
 */
export default function OrdersPage() {
  return <OrdersClient />
}
