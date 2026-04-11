'use client'

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format as fmtDate, parseISO } from 'date-fns'
import { formatCurrency } from '@/lib/utils'
import type { OrdersOverTimeSeries } from '@/types/analytics.types'

function xLabel(date: string, gran: 'day' | 'week' | 'month') {
  const d = parseISO(date)
  return gran === 'month' ? fmtDate(d, 'MMM yy') : fmtDate(d, 'd MMM')
}

interface Props {
  series: OrdersOverTimeSeries[]
  granularity: 'day' | 'week' | 'month'
  isLoading: boolean
}

export default function OrdersOverTimeChart({ series, granularity, isLoading }: Props) {
  if (isLoading) {
    return <div className="h-72 rounded-lg border border-border bg-card animate-pulse" />
  }

  if (!series.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-lg border border-border bg-card text-sm text-muted-foreground">
        No data for this period
      </div>
    )
  }

  const data = series.map((s) => ({ ...s, label: xLabel(s.date, granularity) }))

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="mb-3 text-sm font-medium">Orders &amp; Revenue Over Time</p>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="orders" orientation="left" tick={{ fontSize: 11 }} />
          <YAxis
            yAxisId="revenue"
            orientation="right"
            tick={{ fontSize: 11 }}
            tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value, name) =>
              name === 'revenue'
                ? [formatCurrency(value as number), 'Revenue']
                : [value, 'Orders']
            }
          />
          <Legend />
          <Bar
            yAxisId="orders"
            dataKey="orders"
            fill="#6366f1"
            name="Orders"
            radius={[3, 3, 0, 0]}
          />
          <Line
            yAxisId="revenue"
            dataKey="revenue"
            stroke="#f59e0b"
            dot={false}
            name="Revenue"
            strokeWidth={2}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
