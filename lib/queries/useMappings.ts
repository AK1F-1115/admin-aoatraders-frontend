'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientApiRequest } from '@/lib/clientApi'
import { updateMapping } from '@/lib/actions/mappings'
import type { Mapping, UpdateMappingBody } from '@/types/mapping.types'

/**
 * Normalise the API response — may return a plain array or a wrapper object.
 * console.log below will reveal the real response shape on first page load.
 */
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

/**
 * GET /admin/mappings
 * Returns all category/brand mappings used in sync filters.
 */
export function useMappings(initialData?: Mapping[]) {
  return useQuery({
    queryKey: ['mappings'],
    queryFn: async () => {
      const raw = await clientApiRequest<unknown>('/admin/mappings')
      return normaliseMappings(raw)
    },
    initialData,
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
