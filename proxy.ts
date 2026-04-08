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
    unauthenticatedPaths: ['/auth/login', '/auth/error'],
  },
})

export const config = {
  // Protect all routes except Next.js internals, static files, favicon, and the auth callback
  matcher: ['/((?!_next/static|_next/image|favicon.ico|auth/callback).*)'],
}
