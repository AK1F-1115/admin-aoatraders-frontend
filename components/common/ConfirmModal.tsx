'use client'

import { useEffect, useRef } from 'react'
import LoadingSpinner from './LoadingSpinner'

interface ConfirmModalProps {
  open: boolean
  title: string
  description: string
  /** Label for the destructive confirm button. Defaults to "Confirm". */
  confirmText?: string
  onConfirm: () => void
  onClose: () => void
  /** Shows a loading spinner on the confirm button while an async action runs */
  loading?: boolean
}

/**
 * A simple, accessible confirmation modal for destructive actions
 * (deactivate store, cancel order, reset shipping, etc.).
 *
 * Uses the native <dialog> element for correct accessibility and focus trapping.
 */
export default function ConfirmModal({
  open,
  title,
  description,
  confirmText = 'Confirm',
  onConfirm,
  onClose,
  loading = false,
}: ConfirmModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  // Sync open state with native <dialog> API
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      if (!dialog.open) dialog.showModal()
    } else {
      if (dialog.open) dialog.close()
    }
  }, [open])

  // Close on Escape (native dialog already handles this, but sync our state)
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleCancel = (e: Event) => {
      e.preventDefault()
      onClose()
    }
    dialog.addEventListener('cancel', handleCancel)
    return () => dialog.removeEventListener('cancel', handleCancel)
  }, [onClose])

  return (
    <dialog
      ref={dialogRef}
      className="rounded-lg border border-border bg-background shadow-lg p-0 w-full max-w-md backdrop:bg-black/50"
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-md border border-border text-foreground hover:bg-accent transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-70"
          >
            {loading && <LoadingSpinner size="sm" />}
            {confirmText}
          </button>
        </div>
      </div>
    </dialog>
  )
}
