import { authkitProxy } from '@workos-inc/authkit-nextjs'

// middlewareAuth.enabled = true moves all session validation and refresh into
// the proxy context, where cookies.set() is permitted in Next.js 16.
// Without this, withAuth() in a Server Component triggers a cookie write during
// page rendering, which Next.js 16 forbids (digest: 432911483).
export default authkitProxy({
  middlewareAuth: {
    enabled: true,
    // Pages that are accessible without being signed in
    unauthenticatedPaths: ['/auth/login', '/auth/error'],
  },
})

export const config = {
  // Protect all routes except Next.js internals, static files, favicon, and the auth callback
  matcher: ['/((?!_next/static|_next/image|favicon.ico|auth/callback).*)'],
}
