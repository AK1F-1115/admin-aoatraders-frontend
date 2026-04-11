'use client'

import { subMonths, format, startOfMonth, endOfMonth } from 'date-fns'
import type { PeriodParams } from '@/lib/queries/useAnalytics'

export type PeriodOption = 'this-month' | 'last-month' | 'last-3m' | 'last-12m'

export function derivePeriodParams(option: PeriodOption): PeriodParams {
  const now = new Date()
  switch (option) {
    case 'this-month':
      return { period: format(now, 'yyyy-MM') }
    case 'last-month':
      return { period: format(subMonths(now, 1), 'yyyy-MM') }
    case 'last-3m':
      return { start: format(subMonths(now, 3), 'yyyy-MM-dd'), end: format(now, 'yyyy-MM-dd') }
    case 'last-12m':
      return { start: format(subMonths(now, 12), 'yyyy-MM-dd'), end: format(now, 'yyyy-MM-dd') }
  }
}

export function deriveStartEnd(option: PeriodOption): { start: string; end: string } {
  const now = new Date()
  switch (option) {
    case 'this-month':
      return {
        start: format(startOfMonth(now), 'yyyy-MM-dd'),
        end: format(endOfMonth(now), 'yyyy-MM-dd'),
      }
    case 'last-month': {
      const last = subMonths(now, 1)
      return {
        start: format(startOfMonth(last), 'yyyy-MM-dd'),
        end: format(endOfMonth(last), 'yyyy-MM-dd'),
      }
    }
    case 'last-3m':
      return { start: format(subMonths(now, 3), 'yyyy-MM-dd'), end: format(now, 'yyyy-MM-dd') }
    case 'last-12m':
      return { start: format(subMonths(now, 12), 'yyyy-MM-dd'), end: format(now, 'yyyy-MM-dd') }
  }
}

const OPTIONS: { value: PeriodOption; label: string }[] = [
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'last-3m', label: 'Last 3 Months' },
  { value: 'last-12m', label: 'Last 12 Months' },
]

interface PeriodSelectorProps {
  value: PeriodOption
  onChange: (v: PeriodOption) => void
}

export default function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <select
      className="rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
      value={value}
      onChange={(e) => onChange(e.target.value as PeriodOption)}
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
