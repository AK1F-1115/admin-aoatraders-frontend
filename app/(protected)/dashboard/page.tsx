/**
 * /dashboard — Platform Overview
 *
 * Server Component: fetches analytics summary, sync status, and recent orders
 * in parallel. Each fetch is individually fault-tolerant via Promise.allSettled.
 */
import { redirect } from 'next/navigation'
import { Building2, DollarSign, ShoppingCart, Package } from 'lucide-react'
import { apiRequest, UnauthorizedError } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import type { AnalyticsSummary } from '@/types/analytics.types'
import type { SyncSummaryRow } from '@/types/sync.types'
import type { Order } from '@/types/order.types'
import type { PaginatedResponse } from '@/types/api.types'
import KpiCard from '@/components/dashboard/KpiCard'
import SyncHealthPanel from '@/components/dashboard/SyncHealthPanel'
import RecentOrdersTable from '@/components/dashboard/RecentOrdersTable'
import { triggerEssendantSync, triggerShopifySync } from '@/lib/actions/sync'

export default async function DashboardPage() {
  // Parallel fetch — a single failure won't crash the whole page
  const [summaryResult, syncResult, ordersResult] = await Promise.allSettled([
    apiRequest<AnalyticsSummary>('/admin/analytics/summary'),
    apiRequest<SyncSummaryRow[]>('/admin/sync/summary'),
    apiRequest<PaginatedResponse<Order> | Order[]>('/admin/orders?per_page=5'),
  ])

  // If any API call returned 401, boot to login
  if (
    [summaryResult, syncResult, ordersResult].some(
      (r) => r.status === 'rejected' && r.reason instanceof UnauthorizedError,
    )
  ) {
    redirect('/auth/login')
  }

  const summary = summaryResult.status === 'fulfilled' ? summaryResult.value : null
  const syncRaw = syncResult.status === 'fulfilled' ? syncResult.value : null
  // Handle both SyncSummaryRow[] directly and any { syncs: [...] } wrapper
  const syncSummary: SyncSummaryRow[] | null = syncRaw === null
    ? null
    : Array.isArray(syncRaw)
      ? syncRaw
      : Array.isArray((syncRaw as Record<string, unknown>)['syncs'])
        ? (syncRaw as Record<string, unknown>)['syncs'] as SyncSummaryRow[]
        : null
  const ordersRaw = ordersResult.status === 'fulfilled' ? ordersResult.value : null
  // Handle all common FastAPI response shapes:
  //   - plain array: Order[]
  //   - { items: Order[] }  (standard PaginatedResponse)
  //   - { data: Order[] }   (some FastAPI setups)
  //   - { orders: Order[] } (named key variant)
  const orders: Order[] = Array.isArray(ordersRaw)
    ? ordersRaw
    : ((ordersRaw as Record<string, unknown> | null)?.['items'] as Order[] | undefined)
      ?? ((ordersRaw as Record<string, unknown> | null)?.['data'] as Order[] | undefined)
      ?? ((ordersRaw as Record<string, unknown> | null)?.['orders'] as Order[] | undefined)
      ?? []
  // Temporary: capture raw order data for inline debug panel
  const debugOrderSample = orders.length > 0
    ? JSON.stringify(orders[0], null, 2)
    : ordersRaw !== null
      ? JSON.stringify(ordersRaw).slice(0, 800)
      : null
  const ordersError = ordersResult.status === 'rejected'
  const ordersErrorMessage =
    ordersResult.status === 'rejected'
      ? (ordersResult.reason as Error)?.message
      : undefined
  const summaryError = summaryResult.status === 'rejected'

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of AOA Traders platform operations
        </p>
      </div>

      {/* KPI grid — 1 col → 2 col → 4 col */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Active Stores"
          value={summary?.active_stores ?? '—'}
          icon={Building2}
          description="Stores with active subscription"
          error={summaryError}
        />
        <KpiCard
          title="Monthly Revenue"
          value={summary ? formatCurrency(summary.mrr_shopify_billing) : '—'}
          icon={DollarSign}
          description="Shopify billing MRR"
          error={summaryError}
        />
        <KpiCard
          title="Orders This Month"
          value={summary?.total_orders ?? '—'}
          icon={ShoppingCart}
          description={
            summary?.period_start && summary?.period_end
              ? `${summary.period_start.slice(0, 10)} – ${summary.period_end.slice(0, 10)}`
              : undefined
          }
          error={summaryError}
        />
        <KpiCard
          title="Pending Fulfillment"
          value={summary?.orders_by_status?.purchased ?? '—'}
          icon={Package}
          description="Orders awaiting fulfillment"
          error={summaryError}
        />
      </div>

      {/* Main content — recent orders (2/3) + sync health (1/3) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentOrdersTable orders={orders} error={ordersError} errorMessage={ordersErrorMessage} />
        </div>
        <div>
          <SyncHealthPanel
            syncSummary={syncSummary}
            onEssendantSync={triggerEssendantSync}
            onShopifySync={triggerShopifySync}
          />
        </div>
      </div>

      {/* TEMP DEBUG — remove after field names confirmed */}
      {debugOrderSample && (
        <details className="rounded border border-yellow-400 bg-yellow-50 p-3 text-xs">
          <summary className="cursor-pointer font-semibold text-yellow-800">
            🐛 Debug: raw order[0] from API (click to expand)
          </summary>
          <pre className="mt-2 overflow-auto whitespace-pre-wrap text-yellow-900">
            {debugOrderSample}
          </pre>
        </details>
      )}
    </div>
  )
}

