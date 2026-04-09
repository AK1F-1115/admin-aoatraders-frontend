import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * GET /auth/reset
 *
 * Clears all stale WorkOS cookies before kicking off a fresh OAuth flow.
 *
 * Why this exists:
 *  - `middlewareAuth.enabled=true` means the proxy owns the PKCE dance.
 *    It writes `wos-auth-verifier` at the START of the flow and reads it back
 *    in the callback to verify the OAuth `state` param.
 *  - If a previous auth attempt failed (e.g. exchange error, network blip),
 *    the stale `wos-auth-verifier` is left in the browser.
 *  - The next attempt writes a NEW `wos-auth-verifier` — but if the old one
 *    wasn't evicted (e.g. due to Secure/SameSite attribute mismatch on the
 *    Set-Cookie overwrite), the browser sends both.  WorkOS sees the wrong
 *    one and returns "OAuth state mismatch".
 *
 * Fix: hit this route before starting auth.  It nukes every `wos-*` cookie
 * and the `aoa_admin_token`, then redirects to `/` where the proxy initiates
 * a clean PKCE flow.
 */
export async function GET(req: NextRequest) {
  const cookieStore = await cookies()

  // Purge all WorkOS-managed cookies
  for (const name of ['wos-session', 'wos-auth-verifier']) {
    cookieStore.delete(name)
  }
  // Also drop the AOA token — if present it means a stale session is lingering
  cookieStore.delete('aoa_admin_token')

  // Determine redirect target from ?next= param (defaults to /)
  const next = req.nextUrl.searchParams.get('next') ?? '/'

  return NextResponse.redirect(new URL(next, req.url))
}
