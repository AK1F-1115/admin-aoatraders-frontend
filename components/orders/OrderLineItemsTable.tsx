import { formatMoney } from '@/lib/utils'
import type { OrderItem } from '@/types/order.types'

interface OrderLineItemsTableProps {
  items: OrderItem[]
}

function safe(val: string | null | undefined): number {
  return val ? parseFloat(val) : 0
}

/**
 * Line items table with per-row and totals row.
 * AOA Cost = line_total_cost (merchant_cost × quantity, pre-computed).
 * Merchant Price = shopify_price × quantity (what the customer paid).
 */
export default function OrderLineItemsTable({ items }: OrderLineItemsTableProps) {
  const totals = items.reduce(
    (acc, item) => {
      const aoa = safe(item.line_total_cost)
      const merchant = safe(item.shopify_price) * item.quantity
      return { aoa: acc.aoa + aoa, merchant: acc.merchant + merchant, margin: acc.margin + (merchant - aoa) }
    },
    { aoa: 0, merchant: 0, margin: 0 },
  )

  return (
    <div className="rounded-lg border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            {['AOA SKU', 'Description', 'Supplier', 'Qty', 'AOA Cost', 'Merchant Price', 'Margin'].map((h) => (
              <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((item) => {
            const aoa = safe(item.line_total_cost)
            const merchant = safe(item.shopify_price) * item.quantity
            const margin = merchant - aoa
            return (
              <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs">{item.aoa_sku ?? '—'}</td>
                <td className="px-4 py-3 max-w-xs truncate">{item.product_name ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{item.supplier ?? '—'}</td>
                <td className="px-4 py-3 tabular-nums">{item.quantity}</td>
                <td className="px-4 py-3 tabular-nums">{item.line_total_cost ? formatMoney(aoa) : '—'}</td>
                <td className="px-4 py-3 tabular-nums">{item.shopify_price ? formatMoney(merchant) : '—'}</td>
                <td className={`px-4 py-3 tabular-nums ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {item.line_total_cost && item.shopify_price ? formatMoney(margin) : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot className="border-t bg-muted/50 font-semibold">
          <tr>
            <td className="px-4 py-3" colSpan={4}>Totals</td>
            <td className="px-4 py-3 tabular-nums">{formatMoney(totals.aoa)}</td>
            <td className="px-4 py-3 tabular-nums">{formatMoney(totals.merchant)}</td>
            <td className={`px-4 py-3 tabular-nums ${totals.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatMoney(totals.margin)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
