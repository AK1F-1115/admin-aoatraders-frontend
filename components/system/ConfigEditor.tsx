'use client'

import { useState, useMemo } from 'react'
import { AlertTriangle, Search, Loader2 } from 'lucide-react'
import { useSystemConfig } from '@/lib/queries/useSystem'
import ConfigRow from './ConfigRow'
import type { ConfigEntry } from '@/types/system.types'

// Key-prefix → category label. Checked in order (first match wins).
const CATEGORY_RULES: [RegExp, string][] = [
  [/^(SECRET_KEY|DEBUG|ENVIRONMENT|DATABASE_URL|REDIS_URL|ALLOWED_HOSTS|API_BASE)/i, 'Core'],
  [/^(MAIL_|EMAIL_|SMTP_)/i, 'Email'],
  [/^(SFTP_)/i, 'SFTP'],
  [/^(ICAPS_)/i, 'ICAPS'],
  [/^(ORS_|NASCO_)/i, 'ORS / Nasco'],
  [/^(SHOPIFY_)/i, 'Shopify'],
  [/^(STRIPE_)/i, 'Stripe'],
  [/^(WORKOS_)/i, 'WorkOS'],
  [/^(OPENAI_|ANTHROPIC_|AI_)/i, 'AI'],
]
const OTHER_CATEGORY = 'Other'

function getCategory(key: string): string {
  for (const [re, label] of CATEGORY_RULES) {
    if (re.test(key)) return label
  }
  return OTHER_CATEGORY
}

const CATEGORY_ORDER = [
  'Core', 'Email', 'SFTP', 'ICAPS', 'ORS / Nasco', 'Shopify', 'Stripe', 'WorkOS', 'AI', 'Other',
]

export default function ConfigEditor() {
  const [search, setSearch] = useState('')
  const { data, isLoading, isError, error } = useSystemConfig()

  const grouped = useMemo(() => {
    if (!data?.settings) return {}
    const q = search.toLowerCase()
    const entries = Object.entries(data.settings) as [string, ConfigEntry][]
    const filtered = q
      ? entries.filter(([k, v]) => k.toLowerCase().includes(q) || v.value.toLowerCase().includes(q))
      : entries

    const groups: Record<string, [string, ConfigEntry][]> = {}
    for (const pair of filtered) {
      const cat = getCategory(pair[0])
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(pair)
    }
    return groups
  }, [data, search])

  const orderedCategories = CATEGORY_ORDER.filter((c) => grouped[c]?.length)

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Restart warning banner */}
      <div className="flex items-center gap-2 border-b border-yellow-200 bg-yellow-50 px-4 py-2.5 text-xs text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-300">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        Changes written to <code className="font-mono">.env</code> take effect after a server restart.
      </div>

      {/* Header + search */}
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Config Editor
          {data && (
            <span className="ml-2 font-normal normal-case text-xs">
              ({data.count} keys)
            </span>
          )}
        </h2>
        <div className="relative w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search keys…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-input bg-background pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* States */}
      {isLoading && (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading config…
        </div>
      )}
      {isError && (
        <div className="px-4 py-6 text-sm text-destructive">
          Failed to load config: {(error as Error).message}
        </div>
      )}

      {/* Grouped tables */}
      {!isLoading && !isError && orderedCategories.length === 0 && (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          No config keys match your search.
        </div>
      )}
      {orderedCategories.map((category) => (
        <div key={category}>
          <div className="px-4 py-2 bg-muted/30 border-b border-border">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {category}
            </span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/10">
                <th className="px-4 py-2 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wide w-[35%]">Key</th>
                <th className="px-4 py-2 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wide w-[50%]">Value</th>
                <th className="px-4 py-2 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wide w-[15%]">Edit</th>
              </tr>
            </thead>
            <tbody>
              {grouped[category].map(([key, entry]) => (
                <ConfigRow key={key} configKey={key} entry={entry} />
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
