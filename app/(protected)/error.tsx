'use client'

/**
 * Error boundary for all protected routes.
 *
 * Next.js App Router calls this component whenever a Server Component or
 * Client Component inside app/(protected)/ throws an unhandled error.
 * Showing the actual message here makes production debugging much faster.
 */
export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8">
      <div className="max-w-lg w-full rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
        <h2 className="text-xl font-semibold text-destructive mb-2">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mb-4 font-mono break-all">
          {error.message || 'An unexpected error occurred.'}
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground mb-4">Digest: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
