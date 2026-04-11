'use client'

import { useState } from 'react'
import { useSystemHealth } from '@/lib/queries/useSystem'
import HealthGrid from './HealthGrid'
import LogViewer from './LogViewer'
import FileBrowser from './FileBrowser'
import ConfigEditor from './ConfigEditor'

type Tab = 'logs' | 'files' | 'config'

const TABS: { id: Tab; label: string }[] = [
  { id: 'logs', label: 'Log Viewer' },
  { id: 'files', label: 'File Browser' },
  { id: 'config', label: 'Config Editor' },
]

export default function SystemClient() {
  const { data: health, isLoading, error } = useSystemHealth()
  const [activeTab, setActiveTab] = useState<Tab>('logs')

  return (
    <div className="space-y-6">
      {/* Health grid — always visible above tabs */}
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

      {/* Tab bar */}
      <div className="border-b border-border">
        <nav className="-mb-px flex gap-0" aria-label="System tabs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab panels — keep all mounted so state (scroll pos, selected file) is preserved */}
      <div className={activeTab === 'logs' ? 'block' : 'hidden'}>
        <LogViewer />
      </div>
      <div className={activeTab === 'files' ? 'block' : 'hidden'}>
        <FileBrowser />
      </div>
      <div className={activeTab === 'config' ? 'block' : 'hidden'}>
        <ConfigEditor />
      </div>
    </div>
  )
}

