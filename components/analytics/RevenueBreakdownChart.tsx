'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format as fmtDate, parseISO } from 'date-fns'
import { formatCurrency } from '@/lib/utils'
import type { OrdersOverTimeSeries } from '@/types/analytics.types'

interface Props {
  series: OrdersOverTimeSeries[]
  isLoading: boolean
}

export default function RevenueBreakdownChart({ series, isLoading }: Props) {
  if (isLoading) {
    return <div className="h-72 rounded-lg border border-border bg-card animate-pulse" />
  }

  if (!series.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-lg border border-border bg-card text-sm text-muted-foreground">
        No data available
      </div>
    )
  }

  const data = series.map((s) => ({
    ...s,
    label: fmtDate(parseISO(s.date), 'MMM yy'),
  }))

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="mb-3 text-sm font-medium">Monthly Revenue (last 6 months)</p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip formatter={(v) => [formatCurrency(v as number), 'AOA Revenue']} />
          <Bar dataKey="revenue" fill="#22c55e" name="AOA Revenue" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
