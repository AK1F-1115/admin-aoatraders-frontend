'use client'

import { useQuery } from '@tanstack/react-query'
import { clientApiRequest } from '@/lib/clientApi'
import type { SystemHealth, SystemLogs } from '@/types/system.types'

export function useSystemHealth() {
  return useQuery({
    queryKey: ['system', 'health'],
    queryFn: () => clientApiRequest<SystemHealth>('/admin/system'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  })
}

export function useSystemLogs(lines: number, level: string | null) {
  return useQuery({
    queryKey: ['system', 'logs', lines, level],
    queryFn: () => {
      const qs = new URLSearchParams({ lines: String(lines) })
      if (level) qs.set('level', level)
      return clientApiRequest<SystemLogs>(`/admin/system/logs?${qs}`)
    },
    staleTime: 15_000,
  })
}
