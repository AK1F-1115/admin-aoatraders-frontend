'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientApiRequest } from '@/lib/clientApi'
import { updateMapping } from '@/lib/actions/mappings'
import type { Mapping, MappingsResponse, UpdateMappingBody } from '@/types/mapping.types'

/**
 * Normalise the API response — extracts items array AND pagination metadata.
 * Tries common wrapper keys: mappings, items, data, results.
 * Non-array keys are captured in `meta` for debugging if results are capped.
 */
function normaliseMappings(raw: unknown): MappingsResponse {
  let items: unknown[] = []
  let total = 0
  let meta: Record<string, unknown> = {}

  if (Array.isArray(raw)) {
    items = raw
    total = raw.length
  } else if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    // Extract the array under the most common wrapper keys
    if (Array.isArray(obj.mappings)) items = obj.mappings
    else if (Array.isArray(obj.items)) items = obj.items
    else if (Array.isArray(obj.data)) items = obj.data
    else if (Array.isArray(obj.results)) items = obj.results
    // Capture all non-array fields as pagination metadata
    meta = Object.fromEntries(
      Object.entries(obj).filter(([, v]) => !Array.isArray(v))
    )
    // Try every common total-count field name
    total =
      (typeof obj.total === 'number' ? obj.total : 0) ||
      (typeof obj.total_count === 'number' ? obj.total_count : 0) ||
      (typeof obj.count === 'number' ? obj.count : 0) ||
      items.length
  }

  return { items: items as Mapping[], total, meta }
}

/**
 * GET /admin/mappings?limit=9999
 * Requests a large page to try to get all records in one call.
 * The `total` field in the returned object reflects the server's true count
 * (may differ from items.length if the backend ignores the limit param).
 */
export function useMappings(initialData?: Mapping[]) {
  return useQuery({
    queryKey: ['mappings'],
    queryFn: async () => {
      const raw = await clientApiRequest<unknown>('/admin/mappings?limit=9999')
      return normaliseMappings(raw)
    },
    select: (data) => data,
    initialData: initialData ? { items: initialData, total: initialData.length, meta: {} } : undefined,
    staleTime: 60_000,
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
