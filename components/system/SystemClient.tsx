'use client'

import { useSystemHealth } from '@/lib/queries/useSystem'
import HealthGrid from './HealthGrid'
import LogViewer from './LogViewer'
import FileBrowser from './FileBrowser'
import ConfigEditor from './ConfigEditor'

export default function SystemClient() {
  const { data: health, isLoading, error } = useSystemHealth()

  return (
    <div className="space-y-6">
      {/* Health grid */}
      {isLoading && (
        <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
          Loading system health…
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400 p-4 text-sm">
          Failed to load system health: {(error as Error).message}
        </div>
      )}
      {health && <HealthGrid health={health} />}

      {/* Log viewer */}
      <div>
        <h2 className="mb-3 text-base font-semibold">Log Viewer</h2>
        <LogViewer />
      </div>

      {/* File browser */}
      <div>
        <h2 className="mb-3 text-base font-semibold">File Browser</h2>
        <FileBrowser />
      </div>

      {/* Config editor */}
      <div>
        <h2 className="mb-3 text-base font-semibold">Config Editor</h2>
        <ConfigEditor />
      </div>
    </div>
  )
}

