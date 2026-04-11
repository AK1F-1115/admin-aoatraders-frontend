'use client'

import type { Mapping } from '@/types/mapping.types'

interface MappingTableProps {
  mappings: Mapping[]
}

/**
 * MappingTable — field-discovery skeleton.
 *
 * This renders all keys/values from the live API response so we can confirm
 * the real field names. Replace with a proper editable table once fields are known.
 *
 * Fields confirmed so far: TBD (check browser console for [useMappings] logs)
 */
export default function MappingTable({ mappings }: MappingTableProps) {
  if (mappings.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground text-sm">
        No mappings found.
      </div>
    )
  }

  // Derive column headers from the first item's keys
  const columns = Object.keys(mappings[0]).filter((k) => k !== 'id')

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">ID</th>
              {columns.map((col) => (
                <th key={col} className="px-4 py-3 text-left font-medium text-muted-foreground capitalize">
                  {col.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mappings.map((mapping) => (
              <tr key={mapping.id as number} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                  {String(mapping.id)}
                </td>
                {columns.map((col) => (
                  <td key={col} className="px-4 py-3">
                    {renderCell(mapping[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
        {mappings.length} mapping{mappings.length !== 1 ? 's' : ''} — field names TBD, check browser console for{' '}
        <code className="font-mono">[useMappings]</code> logs
      </div>
    </div>
  )
}

function renderCell(value: unknown): React.ReactNode {
  if (value === null || value === undefined) return <span className="text-muted-foreground">—</span>
  if (typeof value === 'boolean') {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          value
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {value ? 'active' : 'inactive'}
      </span>
    )
  }
  if (Array.isArray(value)) {
    return (
      <span className="text-muted-foreground text-xs font-mono">
        [{value.length} items]
      </span>
    )
  }
  return <span>{String(value)}</span>
}
