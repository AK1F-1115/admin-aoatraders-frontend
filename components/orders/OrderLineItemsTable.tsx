import { formatMoney } from '@/lib/utils'
import type { OrderLineItem } from '@/types/order.types'

interface OrderLineItemsTableProps {
  lineItems: OrderLineItem[]
}

function safeFloat(val: string | null | undefined): number {
  return val ? parseFloat(val) : 0
}

/**
 * Displays order line items with per-row and totals row for AOA Cost, Merchant Price, and Margin.
 */
export default function OrderLineItemsTable({ lineItems }: OrderLineItemsTableProps) {
  const totals = lineItems.reduce(
    (acc, item) => {
      const aoaCost = safeFloat(item.unit_aoa_cost) * item.quantity
      const merchantCost = safeFloat(item.unit_merchant_cost) * item.quantity
      return {
        aoa: acc.aoa + aoaCost,
        merchant: acc.merchant + merchantCost,
        margin: acc.margin + (merchantCost - aoaCost),
      }
    },
    { aoa: 0, merchant: 0, margin: 0 },
  )

  return (
    <div className="rounded-lg border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            {['AOA SKU', 'Description', 'Supplier', 'Qty', 'AOA Cost', 'Merchant Price', 'Margin'].map(
              (h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap"
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody className="divide-y">
          {lineItems.map((item) => {
            const aoaCost = safeFloat(item.unit_aoa_cost) * item.quantity
            const merchantCost = safeFloat(item.unit_merchant_cost) * item.quantity
            const margin = merchantCost - aoaCost
            return (
              <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs">{item.aoa_sku ?? '—'}</td>
                <td className="px-4 py-3 max-w-xs truncate">{item.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{item.supplier ?? '—'}</td>
                <td className="px-4 py-3 tabular-nums">{item.quantity}</td>
                <td className="px-4 py-3 tabular-nums">{item.unit_aoa_cost ? formatMoney(aoaCost) : '—'}</td>
                <td className="px-4 py-3 tabular-nums">{item.unit_merchant_cost ? formatMoney(merchantCost) : '—'}</td>
                <td className={`px-4 py-3 tabular-nums ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {item.unit_merchant_cost && item.unit_aoa_cost ? formatMoney(margin) : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot className="border-t bg-muted/50 font-semibold">
          <tr>
            <td className="px-4 py-3" colSpan={4}>
              Totals
            </td>
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
