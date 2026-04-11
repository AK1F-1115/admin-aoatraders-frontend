'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { OrdersByStatus } from '@/types/analytics.types'

const STATUS_COLOURS: Record<string, string> = {
  pending_purchase: '#94a3b8',
  purchased: '#6366f1',
  fulfillment_sent: '#3b82f6',
  shipped: '#22c55e',
  delivered: '#10b981',
  cancelled: '#ef4444',
  no_aoa_items: '#f59e0b',
}

const STATUS_LABELS: Record<string, string> = {
  pending_purchase: 'Pending Purchase',
  purchased: 'Purchased',
  fulfillment_sent: 'Fulfillment Sent',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  no_aoa_items: 'No AOA Items',
}

interface Props {
  ordersByStatus: OrdersByStatus | undefined
  isLoading: boolean
}

export default function OrderStatusDonut({ ordersByStatus, isLoading }: Props) {
  if (isLoading) {
    return <div className="h-72 rounded-lg border border-border bg-card animate-pulse" />
  }

  const data = ordersByStatus
    ? Object.entries(ordersByStatus)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => ({ name: STATUS_LABELS[k] ?? k, value: v, key: k }))
    : []

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="mb-3 text-sm font-medium">Orders by Status</p>
      {data.length === 0 ? (
        <div className="flex h-60 items-center justify-center text-sm text-muted-foreground">
          No data
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={STATUS_COLOURS[entry.key] ?? '#64748b'} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => [v, '']} />
            <Legend iconType="circle" iconSize={8} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
