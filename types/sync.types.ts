/**
 * Sync status types for the AOA Admin.
 * Matches GET /admin/sync/status response contract (spec §5.7).
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
