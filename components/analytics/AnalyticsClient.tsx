'use client'

import { useState } from 'react'
import { subMonths, format, startOfMonth } from 'date-fns'
import PeriodSelector, {
  type PeriodOption,
  derivePeriodParams,
  deriveStartEnd,
} from './PeriodSelector'
import AnalyticsKpiCards from './AnalyticsKpiCards'
import OrdersOverTimeChart from './OrdersOverTimeChart'
import RevenueBreakdownChart from './RevenueBreakdownChart'
import StorePerformanceTable from './StorePerformanceTable'
import TopProductsTable from './TopProductsTable'
import OrderStatusDonut from './OrderStatusDonut'
import {
  useAnalyticsSummary,
  useAnalyticsStores,
  useOrdersOverTime,
  useTopProducts,
  chooseGranularity,
} from '@/lib/queries/useAnalytics'

// Fixed 6-month window for the revenue breakdown chart (independent of period selector)
const _now = new Date()
const SIX_MONTH_START = format(startOfMonth(subMonths(_now, 5)), 'yyyy-MM-dd')
const SIX_MONTH_END = format(_now, 'yyyy-MM-dd')

export default function AnalyticsClient() {
  const [period, setPeriod] = useState<PeriodOption>('this-month')

  const params = derivePeriodParams(period)
  const { start, end } = deriveStartEnd(period)
  const granularity = chooseGranularity(start, end)

  const summary = useAnalyticsSummary(params)
  const stores = useAnalyticsStores(params)
  const ordersOverTime = useOrdersOverTime(start, end, granularity)
  const revenueTrend = useOrdersOverTime(SIX_MONTH_START, SIX_MONTH_END, 'month')
  const topProducts = useTopProducts(params, 100)

  return (
    <div className="space-y-6">
      {/* Header + period selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Platform performance overview</p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {/* Row 1: KPI cards */}
      <AnalyticsKpiCards summary={summary.data} isLoading={summary.isLoading} />

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <OrdersOverTimeChart
          series={ordersOverTime.data?.series ?? []}
          granularity={granularity}
          isLoading={ordersOverTime.isLoading}
        />
        <RevenueBreakdownChart
          series={revenueTrend.data?.series ?? []}
          isLoading={revenueTrend.isLoading}
        />
      </div>

      {/* Row 3: Store performance */}
      <StorePerformanceTable stores={stores.data ?? []} isLoading={stores.isLoading} />

      {/* Row 4: Top products */}
      <TopProductsTable products={topProducts.data ?? []} isLoading={topProducts.isLoading} />

      {/* Row 5: Order status donut */}
      <div className="max-w-md">
        <OrderStatusDonut
          ordersByStatus={summary.data?.orders_by_status}
          isLoading={summary.isLoading}
        />
      </div>
    </div>
  )
}
