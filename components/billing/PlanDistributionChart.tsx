'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { Store } from '@/types/store.types'
import type { BillingPlan } from '@/types/billing.types'

interface PlanDistributionChartProps {
  stores: Store[]
  plans: BillingPlan[]
}

// Palette: light + dark accessible colours per plan slot (index 0-4, then fall-back)
const SLICE_COLOURS = [
  '#6366f1', // indigo  — Free
  '#22c55e', // green   — Starter
  '#f59e0b', // amber   — Growth
  '#ec4899', // pink    — Pro
  '#14b8a6', // teal    — extra
  '#8b5cf6', // violet  — extra
]

interface ChartEntry {
  name: string
  count: number
  colour: string
}

function buildChartData(stores: Store[], plans: BillingPlan[]): ChartEntry[] {
  // Ordered plan list (by id ascending) so colours are stable
  const orderedPlans = [...plans].sort((a, b) => a.id - b.id)
  const counts: Record<string, number> = {}

  for (const s of stores) {
    if (!s.active) continue
    const slug = s.subscription_plan_slug ?? 'free'
    counts[slug] = (counts[slug] ?? 0) + 1
  }

  // If we have no plan data, surface a single "Unknown" entry
  if (orderedPlans.length === 0) {
    return Object.entries(counts).map(([slug, count], i) => ({
      name: slug,
      count,
      colour: SLICE_COLOURS[i % SLICE_COLOURS.length],
    }))
  }

  return orderedPlans
    .map((p, i) => ({
      name: p.name,
      count: counts[p.slug] ?? 0,
      colour: SLICE_COLOURS[i % SLICE_COLOURS.length],
    }))
    .filter((e) => e.count > 0)
}

interface TooltipPayload {
  name: string
  value: number
  payload: ChartEntry
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: TooltipPayload[]
}) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-semibold">{entry.name}</p>
      <p className="text-muted-foreground">
        {entry.value} store{entry.value !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

export default function PlanDistributionChart({ stores, plans }: PlanDistributionChartProps) {
  const data = buildChartData(stores, plans)

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No active stores to display.
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h2 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
        Plan Distribution
      </h2>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={55}
            paddingAngle={3}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.colour} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span className="text-sm text-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
