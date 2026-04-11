'use client'

import { useQuery } from '@tanstack/react-query'
import { clientApiRequest } from '@/lib/clientApi'
import type { SystemHealth, SystemLogs, FileList, FileContent, SystemConfig } from '@/types/system.types'

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

/** GET /admin/system/files?path=... — directory listing */
export function useFileBrowser(path: string) {
  return useQuery({
    queryKey: ['system', 'files', path],
    queryFn: () =>
      clientApiRequest<FileList>(`/admin/system/files?path=${encodeURIComponent(path)}`),
    staleTime: 30_000,
  })
}

/** GET /admin/system/file?path=... — file content; disabled when path is null */
export function useFileContent(path: string | null) {
  return useQuery({
    queryKey: ['system', 'file', path],
    queryFn: () =>
      clientApiRequest<FileContent>(`/admin/system/file?path=${encodeURIComponent(path!)}`),
    enabled: path !== null,
    staleTime: 60_000,
  })
}

/** GET /admin/system/config — full .env dump with masked secrets */
export function useSystemConfig() {
  return useQuery({
    queryKey: ['system', 'config'],
    queryFn: () => clientApiRequest<SystemConfig>('/admin/system/config'),
    staleTime: 30_000,
  })
}
