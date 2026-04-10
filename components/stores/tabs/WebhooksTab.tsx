'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { clientApiRequest } from '@/lib/clientApi'
import type { StoreWebhooksResponse, RegisterWebhooksResponse } from '@/types/store.types'
import { formatRelativeTime } from '@/lib/utils'

/** Topics every active store must have registered */
const REQUIRED_TOPICS = ['orders/paid']

interface WebhooksTabProps {
  storeId: number
}

export default function WebhooksTab({ storeId }: WebhooksTabProps) {
  const queryClient = useQueryClient()
  const [registerResult, setRegisterResult] = useState<RegisterWebhooksResponse | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['stores', storeId, 'webhooks'],
    queryFn: () => clientApiRequest<StoreWebhooksResponse>(`/admin/stores/${storeId}/webhooks`),
  })

  const mutation = useMutation({
    mutationFn: () =>
      clientApiRequest<RegisterWebhooksResponse>(
        `/admin/stores/${storeId}/register-webhooks`,
        { method: 'POST' },
      ),
    onSuccess: (result) => {
      setRegisterResult(result)
      queryClient.invalidateQueries({ queryKey: ['stores', storeId, 'webhooks'] })
      if (result.ok) {
        toast.success(
          `Webhooks OK. Registered: ${result.registered.length}, Skipped: ${result.skipped.length}`,
        )
      } else {
        toast.error('Some webhooks failed to register')
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to register webhooks')
    },
  })

  if (isLoading) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Loading webhooks…</p>
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Failed to load webhooks: {(error as Error).message}
      </div>
    )
  }

  const webhooks = data?.webhooks ?? []
  const missingTopics = REQUIRED_TOPICS.filter(
    (t) => !webhooks.some((w) => w.topic === t),
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Registered Webhooks</h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
            {data?.count ?? 0}
          </span>
        </div>
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {mutation.isPending ? 'Registering…' : 'Register Missing Webhooks'}
        </button>
      </div>

      {/* Missing topics warning */}
      {missingTopics.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          ⚠️ Missing required webhook{missingTopics.length > 1 ? 's' : ''}:{' '}
          <code className="font-mono">{missingTopics.join(', ')}</code>. Click &apos;Register
          Missing Webhooks&apos; to fix.
        </div>
      )}

      {/* Register result */}
      {registerResult && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            registerResult.ok
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {registerResult.ok ? (
            <span>
              Registered: {registerResult.registered.join(', ') || '(none)'}. Skipped:{' '}
              {registerResult.skipped.join(', ') || '(none)'}. Errors:{' '}
              {registerResult.errors.join(', ') || '(none)'}
            </span>
          ) : (
            <div>
              <p className="font-medium">Registration failed:</p>
              {registerResult.errors.map((e, i) => (
                <p key={i} className="font-mono text-xs mt-1">
                  {e}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Webhook table */}
      {webhooks.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No webhooks registered. Click &apos;Register Missing Webhooks&apos; to add required
          subscriptions.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Topic</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Endpoint URL
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Format</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Registered
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {webhooks.map((webhook) => (
                <tr key={webhook.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                      {webhook.topic}
                    </code>
                  </td>
                  <td
                    className="px-4 py-3 max-w-xs truncate text-xs text-muted-foreground"
                    title={webhook.address}
                  >
                    {webhook.address}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {webhook.format ?? '—'}
                  </td>
                  <td
                    className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap"
                    title={webhook.created_at ?? undefined}
                  >
                    {formatRelativeTime(webhook.created_at)}
                  </td>
                  <td
                    className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap"
                    title={webhook.updated_at ?? undefined}
                  >
                    {formatRelativeTime(webhook.updated_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
