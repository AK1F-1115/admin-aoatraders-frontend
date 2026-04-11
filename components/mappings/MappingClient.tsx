'use client'

import { HydrationBoundary, dehydrate, QueryClient } from '@tanstack/react-query'
import { useMappings } from '@/lib/queries/useMappings'
import MappingTable from '@/components/mappings/MappingTable'
import type { Mapping } from '@/types/mapping.types'

interface MappingClientProps {
  initialData?: Mapping[]
}

function MappingContent() {
  const { data, isLoading, isError } = useMappings()
  const mappings = data?.items ?? []
  const total = data?.total ?? 0
  const isCapped = total > mappings.length

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground text-sm animate-pulse">
        Loading mappings…
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-8 text-center text-destructive text-sm">
        Failed to load mappings.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {isCapped && (
        <div className="rounded-md border border-amber-400/40 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          <strong>Partial results:</strong> showing {mappings.length.toLocaleString()} of{' '}
          {total.toLocaleString()} total mappings. The API is capping the response —
          check browser console for <code className="font-mono text-xs">meta</code> keys to find the correct pagination param.
        </div>
      )}
      <MappingTable mappings={mappings} serverTotal={total} />
    </div>
  )
}

export default function MappingClient({ initialData }: MappingClientProps) {
  const queryClient = new QueryClient()
  if (initialData) {
    queryClient.setQueryData(['mappings'], {
      items: initialData,
      total: initialData.length,
      meta: {},
    })
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MappingContent />
    </HydrationBoundary>
  )
}
