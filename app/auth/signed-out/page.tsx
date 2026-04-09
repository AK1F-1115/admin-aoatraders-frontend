/**
 * /auth/signed-out — shown after successful sign-out.
 *
 * Lives in unauthenticatedPaths so the middleware never intercepts it,
 * meaning NO automatic auth flow is triggered on landing here.
 * The user manually clicks "Sign in" which starts a single, clean PKCE flow.
 */
export default function SignedOutPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="max-w-md w-full rounded-lg border border-border bg-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground mb-3">Signed out</h1>
        <p className="text-sm text-muted-foreground">
          You have been signed out of AOA Traders Admin.
        </p>
        <a
          href="/"
          className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Sign in again
        </a>
      </div>
    </main>
  )
}
