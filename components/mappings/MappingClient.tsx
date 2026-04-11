'use client'

import { HydrationBoundary, dehydrate, QueryClient } from '@tanstack/react-query'
import { useMappings } from '@/lib/queries/useMappings'
import MappingTable from '@/components/mappings/MappingTable'
import type { Mapping } from '@/types/mapping.types'

interface MappingClientProps {
  initialData?: Mapping[]
}

function MappingContent() {
  const { data: mappings = [], isLoading, isError } = useMappings()

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

  return <MappingTable mappings={mappings} />
}

export default function MappingClient({ initialData }: MappingClientProps) {
  const queryClient = new QueryClient()
  if (initialData) {
    queryClient.setQueryData(['mappings'], initialData)
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MappingContent />
    </HydrationBoundary>
  )
}
