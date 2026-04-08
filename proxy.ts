import { authkitProxy } from '@workos-inc/authkit-nextjs'

export default authkitProxy({
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
})

export const config = {
  // Protect all routes except Next.js internals, static files, favicon, and the auth callback
  matcher: ['/((?!_next/static|_next/image|favicon.ico|auth/callback).*)'],
}
