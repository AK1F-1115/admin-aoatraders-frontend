'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

interface SyncTriggerButtonProps {
  /**
   * A Server Action (or async function) to call when the button is pressed.
   * Should POST to the relevant sync endpoint via lib/api.ts on the server.
   */
  action: () => Promise<void>
  label: string
  className?: string
}

/**
 * Reusable sync trigger button.
 *
 * State machine:
 *   idle → pending (in-flight, spinner) → queued (Queued ✓, 3s) → idle
 *
 * On error: shows react-hot-toast, returns to idle.
 */
export default function SyncTriggerButton({ action, label, className = '' }: SyncTriggerButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [queued, setQueued] = useState(false)

  function handleClick() {
    if (isPending || queued) return
    startTransition(async () => {
      try {
        await action()
        setQueued(true)
        setTimeout(() => setQueued(false), 3000)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Sync trigger failed')
      }
    })
  }

  const isDisabled = isPending || queued

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-border bg-background hover:bg-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {isPending ? (
        <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : queued ? (
        <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true" />
      ) : (
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
      )}
      {isPending ? 'Queuing…' : queued ? 'Queued ✓' : label}
    </button>
  )
}
