/**
 * /sync — Sync Monitor
 *
 * Server Component: fetches the latest pipeline summary server-side for fast
 * initial render. SyncClient takes over for live 30-second polling.
 */
import { redirect } from 'next/navigation'
import { apiRequest, UnauthorizedError } from '@/lib/api'
import type { SyncSummaryRow } from '@/types/sync.types'
import SyncClient from '@/components/sync/SyncClient'

export default async function SyncPage() {
  let initialData: SyncSummaryRow[] = []

  try {
    const raw = await apiRequest<unknown>('/admin/sync/summary')
    if (Array.isArray(raw)) {
      initialData = raw as SyncSummaryRow[]
    } else if (raw && typeof raw === 'object') {
      const obj = raw as Record<string, unknown>
      if (Array.isArray(obj.syncs)) initialData = obj.syncs as SyncSummaryRow[]
    }
  } catch (err) {
    if (err instanceof UnauthorizedError) redirect('/auth/reset')
    // Non-fatal: SyncClient renders with empty initial data, poll will fill it
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sync Monitor</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time status of all AOA sync pipelines — trigger manual runs or monitor health
        </p>
      </div>

      <SyncClient initialData={initialData} />
    </div>
  )
}
