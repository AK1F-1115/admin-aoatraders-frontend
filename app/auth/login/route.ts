import { getSignInUrl } from '@workos-inc/authkit-nextjs'
import { NextResponse } from 'next/server'

/**
 * GET /auth/login — Route Handler (NOT a page).
 *
 * Must be a Route Handler, not a Server Component, because getSignInUrl()
 * internally writes a PKCE cookie. Next.js 16 forbids cookies.set() during
 * Server Component rendering — it is only permitted in Route Handlers,
 * Server Actions, and Proxy (middleware).
 *
 * Flow: proxy sees no session → redirects to /auth/login → this handler
 * calls getSignInUrl() (sets PKCE cookie) → redirects to WorkOS hosted login.
 */
export async function GET() {
  const url = await getSignInUrl({ returnTo: '/dashboard' })
  return NextResponse.redirect(url)
}
