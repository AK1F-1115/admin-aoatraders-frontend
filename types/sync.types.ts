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
  status: string          // 'success' | 'error' | 'skipped' | 'partial' | 'failed'
  started_at: string
  finished_at: string | null
  records_read: number | null
  records_matched: number | null
  updates_sent: number | null
  message: string | null
}

/**
 * Display metadata for each known pipeline job type.
 * Used to render human-readable labels and determine trigger eligibility.
 */
export interface PipelineMeta {
  label: string
  /** Which records field to show in the table */
  recordsField: 'records_read' | 'records_matched' | 'updates_sent' | 'message'
  /** Whether a manual trigger button should be shown */
  triggerable: boolean
  triggerType?: 'essendant' | 'shopify'
}

export const PIPELINE_META: Record<string, PipelineMeta> = {
  essendant_ingest: {
    label: 'ICAPS Ingest',
    recordsField: 'records_read',
    triggerable: true,
    triggerType: 'essendant',
  },
  retail_product_push: {
    label: 'Retail Products',
    recordsField: 'updates_sent',
    triggerable: true,
    triggerType: 'shopify',
  },
  vds_product_push: {
    label: 'VDS Products',
    recordsField: 'updates_sent',
    triggerable: false,
  },
  price_sync: {
    label: 'Price Sync',
    recordsField: 'updates_sent',
    triggerable: false,
  },
  inventory_sync: {
    label: 'Inventory Sync',
    recordsField: 'updates_sent',
    triggerable: false,
  },
  status_sync: {
    label: 'Status Sync',
    recordsField: 'updates_sent',
    triggerable: false,
  },
  auto_charge_cron: {
    label: 'Billing Cron',
    recordsField: 'message',
    triggerable: false,
  },
}

