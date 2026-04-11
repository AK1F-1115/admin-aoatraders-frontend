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

function normaliseMappings(raw: unknown): Mapping[] {
  let items: unknown[] = []
  if (Array.isArray(raw)) {
    items = raw
  } else if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    if (Array.isArray(obj.mappings)) items = obj.mappings
    else if (Array.isArray(obj.items)) items = obj.items
    else if (Array.isArray(obj.data)) items = obj.data
  }
  return items as Mapping[]
}

export default async function MappingsPage() {
  let initialData: Mapping[] | undefined

  try {
    const raw = await apiRequest<unknown>('/admin/mappings?limit=9999')
    initialData = normaliseMappings(raw)
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
