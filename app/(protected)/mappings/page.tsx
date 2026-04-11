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
const CONCURRENCY = 10

export default async function MappingsPage() {
  let initialData: Mapping[] | undefined

  try {
    // Fetch all pages server-side using parallel waves for speed.
    const fetchPage = (offset: number) =>
      apiRequest<unknown>(`/admin/mappings?limit=${FETCH_BATCH}&offset=${offset}`).then(normalisePage)

    const all: Mapping[] = []
    const first = await fetchPage(0)
    all.push(...first)

    if (first.length === FETCH_BATCH) {
      let offset = FETCH_BATCH
      while (true) {
        const offsets = Array.from({ length: CONCURRENCY }, (_, i) => offset + i * FETCH_BATCH)
        const pages = await Promise.all(offsets.map(fetchPage))
        let done = false
        for (const page of pages) {
          all.push(...page)
          if (page.length < FETCH_BATCH) { done = true; break }
        }
        if (done) break
        offset += CONCURRENCY * FETCH_BATCH
      }
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
