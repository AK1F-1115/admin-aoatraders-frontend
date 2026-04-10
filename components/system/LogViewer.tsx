'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useSystemLogs } from '@/lib/queries/useSystem'
import type { LogEntry } from '@/types/system.types'

const LINE_OPTIONS = [50, 100, 200, 500] as const
const LEVEL_OPTIONS = [
  { label: 'ALL', value: null },
  { label: 'DEBUG', value: 'DEBUG' },
  { label: 'INFO', value: 'INFO' },
  { label: 'WARNING', value: 'WARNING' },
  { label: 'ERROR', value: 'ERROR' },
  { label: 'CRITICAL', value: 'CRITICAL' },
] as const

const LEVEL_COLORS: Record<string, string> = {
  DEBUG: 'bg-gray-100 text-gray-600',
  INFO: 'bg-blue-100 text-blue-700',
  WARNING: 'bg-yellow-100 text-yellow-700',
  ERROR: 'bg-red-100 text-red-700',
  CRITICAL: 'bg-red-900 text-white',
}

/** Parse "store=3 | app:161" context into { storeId, location } */
function parseContext(context: string | undefined): {
  storeId: string | null
  location: string
} {
  if (!context) return { storeId: null, location: '' }
  const parts = context.split(' | ')
  const storeTag = parts.find((p) => p.startsWith('store='))
  const storeId = storeTag ? storeTag.replace('store=', '') : null
  const location = parts.filter((p) => !p.startsWith('store=')).join(' | ')
  return { storeId, location }
}

function LogRow({
  entry,
  index,
  isExpanded,
  onToggle,
}: {
  entry: LogEntry
  index: number
  isExpanded: boolean
  onToggle: () => void
}) {
  // Traceback / continuation line — only has `raw`
  if (!entry.timestamp) {
    return (
      <tr className="bg-muted/20">
        <td colSpan={4} className="px-4 py-1 font-mono text-xs text-muted-foreground whitespace-pre-wrap">
          {entry.raw}
        </td>
      </tr>
    )
  }

  const { storeId, location } = parseContext(entry.context)
  const levelColor = LEVEL_COLORS[entry.level ?? ''] ?? 'bg-gray-100 text-gray-600'

  return (
    <>
      <tr
        className="hover:bg-muted/30 cursor-pointer transition-colors"
        onClick={onToggle}
        title="Click to expand raw entry"
      >
        <td className="px-4 py-2 text-xs font-mono text-muted-foreground whitespace-nowrap">
          {entry.timestamp}
        </td>
        <td className="px-4 py-2">
          <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${levelColor}`}>
            {entry.level}
          </span>
        </td>
        <td className="px-4 py-2 text-xs">
          {storeId && (
            <span className="mr-1.5 rounded bg-blue-50 px-1.5 py-0.5 text-xs font-mono text-blue-700">
              store {storeId}
            </span>
          )}
          <span className="font-mono text-muted-foreground">{location}</span>
        </td>
        <td className="px-4 py-2 text-xs max-w-md truncate">{entry.message}</td>
      </tr>
      {isExpanded && (
        <tr className="bg-muted/30">
          <td colSpan={4} className="px-4 py-2">
            <pre className="text-xs font-mono whitespace-pre-wrap text-muted-foreground">
              {entry.raw}
            </pre>
          </td>
        </tr>
      )}
    </>
  )
}

export default function LogViewer() {
  const [lines, setLines] = useState<number>(200)
  const [level, setLevel] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const { data, isLoading, isFetching, refetch } = useSystemLogs(lines, level)

  function toggleExpand(i: number) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  function handleLinesChange(n: number) {
    setLines(n)
    setExpanded(new Set())
  }

  function handleLevelChange(l: string | null) {
    setLevel(l)
    setExpanded(new Set())
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      {/* Controls bar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b bg-card px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Lines:</span>
          {LINE_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => handleLinesChange(n)}
              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                lines === n
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-accent'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Level:</span>
          {LEVEL_OPTIONS.map(({ label, value }) => (
            <button
              key={label}
              onClick={() => handleLevelChange(value)}
              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                level === value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-accent'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="ml-auto flex items-center gap-1.5 rounded px-2 py-1 text-xs bg-muted hover:bg-accent transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Alerts */}
      {data?.warning && (
        <div className="border-b bg-yellow-50 px-4 py-2 text-sm text-yellow-700">
          ⚠ {data.warning}
        </div>
      )}
      {data?.error && (
        <div className="border-b bg-red-50 px-4 py-2 text-sm text-red-700">
          Error reading log: {data.error}
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading logs…</div>
      ) : !data?.entries.length ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No log entries found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                  Timestamp
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Level</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Context</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[...data.entries].reverse().map((entry, i) => (
                <LogRow
                  key={i}
                  entry={entry}
                  index={i}
                  isExpanded={expanded.has(i)}
                  onToggle={() => toggleExpand(i)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      {data && (
        <div className="border-t px-4 py-2 text-xs text-muted-foreground">
          {data.lines_returned} entries from{' '}
          <code className="font-mono">{data.log_file}</code>
        </div>
      )}
    </div>
  )
}
