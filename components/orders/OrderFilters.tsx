'use client'

import { useRef } from 'react'
import { Search } from 'lucide-react'
import { cn, stripShopifyDomain } from '@/lib/utils'
import type { Store } from '@/types/store.types'

interface StatusTab { readonly value: string; readonly label: string }

interface OrderFiltersProps {
  statuses: readonly StatusTab[]
  stores: Store[]
  activeStatus: string
  activeStore: number | null
  search: string
  onStatus: (s: string) => void
  onStore: (id: number | null) => void
  onSearch: (s: string) => void
}

/**
 * Status tabs + store dropdown + search input for the Order Queue page.
 * Search is debounced 400ms to avoid over-querying on each keystroke.
 */
export default function OrderFilters({
  statuses, stores, activeStatus, activeStore, search,
  onStatus, onStore, onSearch,
}: OrderFiltersProps) {
  const timer = useRef<ReturnType<typeof setTimeout>>(null)

  const handleSearch = (value: string) => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => onSearch(value), 400)
  }

  return (
    <div className="space-y-3">
      {/* Status tabs */}
      <div className="flex flex-wrap gap-1 border-b pb-2">
        {statuses.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onStatus(value)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-md font-medium transition-colors',
              activeStatus === value
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Store dropdown + search */}
      <div className="flex flex-wrap gap-3">
        <select
          value={activeStore ?? ''}
          onChange={(e) => onStore(e.target.value ? Number(e.target.value) : null)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All Stores</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>{stripShopifyDomain(s.shop_domain)}</option>
          ))}
        </select>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            defaultValue={search}
            placeholder="Search order # or customer…"
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background pl-9 pr-3 text-sm"
          />
        </div>
      </div>
    </div>
  )
}
