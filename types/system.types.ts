/**
 * System health and log types for the AOA Admin.
 * Matches GET /admin/system and GET /admin/system/logs contracts (commit a7a3424).
 */

export interface CronLastRun {
  started_at: string         // ISO 8601
  finished_at: string | null
  status: 'success' | 'partial' | 'failed'
  message: string            // "processed=N ok=N failed=N"
}

export interface SystemHealth {
  api_status: 'ok'
  uptime: string             // e.g. "10h 20m 4s"
  uptime_seconds: number
  database: {
    status: 'ok' | 'error'
    error: string | null
  }
  alembic_heads: string[]    // normally 2 hashes; may contain "error: ..."
  pending_charges: number
  cron_last_run: CronLastRun | null
  sync_errors_24h: number
  services: {
    aoa_traders: 'active'
    icaps_watcher: 'active' | 'inactive' | 'failed' | 'unknown' | 'unavailable'
  }
}

export interface LogEntry {
  // Present on well-formed log lines:
  timestamp?: string   // "YYYY-MM-DD HH:MM:SS,mmm"
  level?: string       // "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL"
  context?: string     // e.g. "store=3 | app:161" or "app:161"
  message?: string
  // Always present:
  raw: string
}

export interface SystemLogs {
  log_file: string
  lines_returned: number
  entries: LogEntry[]
  warning?: string   // log file not found
  error?: string     // read error
}
