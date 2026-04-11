/**
 * /mappings — Supplier SKU → Shopify Variant Mapping Editor
 *
 * Server Component: fetches all mappings server-side for fast initial render.
 * MappingClient hydrates with TanStack Query for live active-state updates.
 */
import { redirect } from 'next/navigation'
import { apiRequest, UnauthorizedError } from '@/lib/api'
import type { Mapping } from '@/types/mapping.types'
import MappingClient from '@/components/mappings/MappingClient'

function normalisePage(raw: unknown): Mapping[] {
  if (Array.isArray(raw)) return raw as Mapping[]
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    if (Array.isArray(obj.mappings)) return obj.mappings as Mapping[]
    if (Array.isArray(obj.items)) return obj.items as Mapping[]
    if (Array.isArray(obj.data)) return obj.data as Mapping[]
    if (Array.isArray(obj.results)) return obj.results as Mapping[]
  }
  return []
}

const FETCH_BATCH = 200

export default async function MappingsPage() {
  let initialData: Mapping[] | undefined

  try {
    // Fetch all pages server-side so the initial render has the full dataset.
    const all: Mapping[] = []
    let offset = 0
    for (let i = 0; i < 500; i++) {
      const raw = await apiRequest<unknown>(`/admin/mappings?limit=${FETCH_BATCH}&offset=${offset}`)
      const page = normalisePage(raw)
      all.push(...page)
      if (page.length < FETCH_BATCH) break
      offset += FETCH_BATCH
    }
    initialData = all
  } catch (err) {
    if (err instanceof UnauthorizedError) redirect('/auth/reset')
    // Non-fatal: client will fetch on mount
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mappings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Supplier SKU → Shopify variant mappings used in inventory sync.
        </p>
      </div>

      <MappingClient initialData={initialData} />
    </div>
  )
}
