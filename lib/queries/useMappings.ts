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

/**
 * Fetch ALL mappings by looping through offset pages until the API returns
 * a partial page (< FETCH_BATCH items), signalling the last page.
 * Safety cap: 500 pages = 100k items max.
 */
async function fetchAllMappingPages(): Promise<Mapping[]> {
  const all: Mapping[] = []
  let offset = 0
  for (let i = 0; i < 500; i++) {
    const raw = await clientApiRequest<unknown>(
      `/admin/mappings?limit=${FETCH_BATCH}&offset=${offset}`,
    )
    const page = normalisePage(raw)
    all.push(...page)
    if (page.length < FETCH_BATCH) break // last page reached
    offset += FETCH_BATCH
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
