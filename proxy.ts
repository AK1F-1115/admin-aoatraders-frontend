import { authkitProxy } from '@workos-inc/authkit-nextjs'

// redirectUri is passed explicitly using NEXT_PUBLIC_APP_URL to avoid relying on
// NEXT_PUBLIC_WORKOS_REDIRECT_URI. Without an explicit redirectUri, the library
// defaults to '' (empty string), causing WorkOS to reject the authorization request
// and redirect back with ?error=... instead of ?code=..., which surfaces as
// "Missing required auth parameter" in the callback route.
export default authkitProxy({
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
  middlewareAuth: {
    enabled: true,
    // /auth/error must be unauthenticated so users can see the error page.
    // /auth/login is intentionally NOT listed here — the proxy handles all
    // redirects to WorkOS directly (generating PKCE itself). Having a separate
    // /auth/login Route Handler also generating PKCE would overwrite the proxy's
    // PKCE cookie and cause 'OAuth state mismatch' on the callback.
    unauthenticatedPaths: ['/auth/error'],
  },
})

export const config = {
  // Protect all routes except Next.js internals, static files, favicon, and the auth callback
  matcher: ['/((?!_next/static|_next/image|favicon.ico|auth/callback).*)'],
}
