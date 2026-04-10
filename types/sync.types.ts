/**
 * Sync status types for the AOA Admin.
 * Updated for backend commit 97855ec — added SyncSummaryRow for GET /admin/sync/summary.
 */

export interface SyncTypeStatus {
  /** Identifies the sync job, e.g. 'essendant_ingest', 'retail_push', 'vds_push' */
  sync_type: string
  last_run: string | null
  duration_seconds: number | null
  status: 'ok' | 'error' | 'running' | null
  last_error: string | null
}

export interface SyncStatusResponse {
  syncs: SyncTypeStatus[]
}

/**
 * One entry per pipeline from GET /admin/sync/summary.
 * One row per job_type showing its most recent run.
 */
export interface SyncSummaryRow {
  job_type: string        // 'essendant_ingest' | 'shopify_inventory' | 'price_sync' | etc.
  store_id: number | null // null for global jobs (essendant), set for per-store jobs
  status: string          // 'success' | 'error' | 'skipped'
  started_at: string
  finished_at: string | null
  records_read: number | null
  records_matched: number | null
  updates_sent: number | null
  message: string | null
}
