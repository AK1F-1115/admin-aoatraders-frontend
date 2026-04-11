'use client'

import { useState, useTransition } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Pencil, Lock, Check, X, Loader2 } from 'lucide-react'
import { patchSystemConfig } from '@/lib/actions/system'
import type { ConfigEntry } from '@/types/system.types'

interface ConfigRowProps {
  configKey: string
  entry: ConfigEntry
}

export default function ConfigRow({ configKey, entry }: ConfigRowProps) {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(entry.value)
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleEdit() {
    setDraft(entry.masked ? '' : entry.value)
    setFeedback(null)
    setEditing(true)
  }

  function handleCancel() {
    setEditing(false)
    setFeedback(null)
  }

  function handleSave() {
    startTransition(async () => {
      try {
        const result = await patchSystemConfig({ [configKey]: draft })
        if (result.ok) {
          setFeedback({ ok: true, msg: `Saved (applied: ${result.applied.join(', ')})` })
          await queryClient.invalidateQueries({ queryKey: ['system', 'config'] })
          setEditing(false)
        } else {
          setFeedback({ ok: false, msg: result.note ?? 'Not applied' })
        }
      } catch (err) {
        setFeedback({ ok: false, msg: (err as Error).message })
      }
    })
  }

  // Display value: masked entries show bullet placeholder
  const displayValue = entry.masked ? '••••••••••••' : entry.value || <span className="text-muted-foreground italic">empty</span>

  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
      {/* Key */}
      <td className="px-4 py-2.5 font-mono text-xs text-foreground align-top w-[35%]">
        {configKey}
      </td>

      {/* Value */}
      <td className="px-4 py-2.5 text-xs align-top w-[50%]">
        {editing ? (
          <div className="flex flex-col gap-1.5">
            <input
              type={entry.masked ? 'password' : 'text'}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
              className="w-full rounded border border-input bg-background px-2 py-1 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder={entry.masked ? 'Enter new value…' : undefined}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
                if (e.key === 'Escape') handleCancel()
              }}
            />
            {feedback && (
              <p className={`text-[11px] ${feedback.ok ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                {feedback.msg}
              </p>
            )}
          </div>
        ) : (
          <span className="font-mono text-muted-foreground break-all flex items-center gap-1.5">
            {entry.masked && <Lock className="h-3 w-3 shrink-0 text-muted-foreground" />}
            {displayValue}
          </span>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-2.5 text-xs align-top w-[15%]">
        {entry.patchable ? (
          editing ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={isPending}
                className="flex items-center gap-1 text-green-600 dark:text-green-400 hover:opacity-80 disabled:opacity-40"
                title="Save"
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isPending}
                className="text-muted-foreground hover:text-foreground disabled:opacity-40"
                title="Cancel"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleEdit}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              title="Edit"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )
        ) : (
          <span className="text-[11px] text-muted-foreground/50">read-only</span>
        )}
      </td>
    </tr>
  )
}
