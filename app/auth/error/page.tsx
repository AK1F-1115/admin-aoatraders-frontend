/**
 * Auth error page — displayed when the WorkOS ↔ AOA exchange fails.
 *
 * Receives a `reason` query param from /auth/callback/route.ts onError handler.
 *
 * Possible reasons (from POST /auth/admin/exchange):
 *  - 401: token decode failure, WorkOS user not found, or org membership check failed
 *  - 403: user not in WORKOS_ADMIN_ORG_ID, or not role=admin in AOA users table
 *  - 503: WorkOS env vars not configured on server
 *
 * Source of truth: ADMIN_FRONTEND.md §14
 */
export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>
}) {
  const { reason } = await searchParams
  const message = reason ? decodeURIComponent(reason) : 'An unexpected error occurred during sign-in.'

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="max-w-md w-full rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <h1 className="text-2xl font-semibold text-red-800 mb-3">Access Denied</h1>
        <p className="text-red-700 text-sm leading-relaxed">{message}</p>
        <p className="mt-4 text-xs text-red-500">
          If you believe this is an error, contact the AOA operations team.
        </p>
        <a
          href="/"
          className="mt-6 inline-block rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 transition-colors"
        >
          Try signing in again
        </a>
      </div>
    </main>
  )
}
