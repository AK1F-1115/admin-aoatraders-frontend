'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientApiRequest } from '@/lib/clientApi'
import { updateMapping } from '@/lib/actions/mappings'
import type { Mapping, UpdateMappingBody } from '@/types/mapping.types'

/** Extract the items array from an API response (plain array or wrapped object). */
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

/** Items per request — matches the API default page size. */
const FETCH_BATCH = 200
/** Number of concurrent page requests per wave. */
const CONCURRENCY = 10

/**
 * Fetch ALL mappings using parallel waves of CONCURRENCY requests.
 * - Probes offset 0 first; if a full page returns, fires the next
 *   CONCURRENCY offsets in parallel, repeating until a partial page signals
 *   the end.  ~10× faster than sequential for large datasets.
 */
async function fetchAllMappingPages(): Promise<Mapping[]> {
  const fetchPage = (offset: number) =>
    clientApiRequest<unknown>(
      `/admin/mappings?limit=${FETCH_BATCH}&offset=${offset}`,
    ).then(normalisePage)

  const all: Mapping[] = []

  // Probe: sequential first page to decide whether more pages exist.
  const first = await fetchPage(0)
  all.push(...first)
  if (first.length < FETCH_BATCH) return all

  // Parallel waves until a partial page is found.
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

  return all
}

/**
 * GET /admin/mappings — fetches ALL pages via offset pagination.
 * SSR initialData provides instant render; this query re-fetches all pages
 * in the background once stale (5 min).
 */
export function useMappings(initialData?: Mapping[]) {
  return useQuery({
    queryKey: ['mappings'],
    queryFn: fetchAllMappingPages,
    initialData,
    staleTime: 5 * 60_000,
  })
}

/**
 * Mutation: PATCH /admin/mappings/{id}
 * Calls the server action and invalidates the query cache on success.
 */
export function useUpdateMapping() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateMappingBody }) =>
      updateMapping(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mappings'] })
    },
  })
}
