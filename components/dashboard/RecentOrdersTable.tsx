import type { Order } from '@/types/order.types'
import StatusBadge from '@/components/common/StatusBadge'
import { formatRelativeTime, formatCurrency, stripShopifyDomain } from '@/lib/utils'

interface RecentOrdersTableProps {
  orders: Order[]
  error?: boolean
  errorMessage?: string
}

/**
 * Server component — renders the five most recent orders on the dashboard.
 *
 * Columns: Order #, Store, Status, Amount, Date
 */
export default function RecentOrdersTable({ orders, error, errorMessage }: RecentOrdersTableProps) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="px-6 py-4 border-b">
        <h2 className="text-base font-semibold">Recent Orders</h2>
      </div>

      {error ? (
        <div className="px-6 py-4">
          <p className="text-sm text-destructive">Failed to load orders.</p>
          {errorMessage && (
            <p className="text-xs text-muted-foreground mt-1 font-mono">{errorMessage}</p>
          )}
        </div>
      ) : orders.length === 0 ? (
        <p className="px-6 py-4 text-sm text-muted-foreground">No orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-6 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                  Order
                </th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                  Store
                </th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                  Status
                </th>
                <th className="px-6 py-3 text-right font-medium text-muted-foreground whitespace-nowrap">
                  Amount
                </th>
                <th className="px-6 py-3 text-right font-medium text-muted-foreground whitespace-nowrap">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                    #{(order.shopify_order_id ?? String(order.id)).slice(-8)}
                  </td>
                  <td className="px-6 py-3 max-w-[140px] truncate">
                    {order.store?.shop_domain
                      ? stripShopifyDomain(order.store.shop_domain)
                      : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-6 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-3 text-right font-medium tabular-nums">
                    {order.total_merchant_cost != null ? formatCurrency(order.total_merchant_cost) : '—'}
                  </td>
                  <td className="px-6 py-3 text-right text-muted-foreground whitespace-nowrap">
                    {formatRelativeTime(order.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
