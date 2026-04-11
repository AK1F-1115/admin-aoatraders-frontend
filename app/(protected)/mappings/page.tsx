/**
 * /mappings — Category/Brand Mapping Editor
 *
 * Server Component: fetches mapping data server-side for fast initial render.
 * MappingClient hydrates with TanStack Query for live updates.
 *
 * Field names TBD — check browser console for [useMappings] logs after first load.
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
    const raw = await apiRequest<unknown>('/admin/mappings')
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
          Category and brand mappings used in sync filters.
        </p>
      </div>

      <MappingClient initialData={initialData} />
    </div>
  )
}
