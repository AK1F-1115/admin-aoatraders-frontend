'use server'

import { signOut as workosSignOut } from '@workos-inc/authkit-nextjs'
import { cookies } from 'next/headers'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.aoatraders.com'

/**
 * Sign-out server action.
 *
 * Full two-layer teardown:
 *   1. POST /auth/admin/logout — server-side jti revocation of the AOA JWT
 *      (must happen BEFORE the cookie is deleted, token needed in Authorization header)
 *   2. Delete both local cookies (aoa_admin_token + wos-session)
 *   3. WorkOS signOut() — clears the WorkOS session so re-visiting /auth/login
 *      doesn't silently re-issue a new AOA token without showing the login screen
 *
 * Step 1 uses a plain fetch (not apiRequest) so that a 401 from the backend
 * (e.g. already-expired token) does not trigger apiRequest's redirect() and
 * short-circuit the rest of the flow. Revocation is best-effort.
 */
export async function signOut() {
  const cookieStore = await cookies()

  // 1. Revoke the AOA JWT server-side (best-effort — never block sign-out on failure)
  const token = cookieStore.get('aoa_admin_token')?.value
  if (token) {
    try {
      await fetch(`${API_BASE}/auth/admin/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
    } catch {
      // Network error or token already expired — token will naturally expire within 24h
    }
  }

  // 2. Clear local cookies
  cookieStore.delete('aoa_admin_token')
  // Clear the WorkOS session cookie locally so a failed WorkOS redirect doesn't
  // leave a stale cookie that causes OAuth state mismatch on the next login.
  cookieStore.delete('wos-session')

  // 3. Terminate the WorkOS session (clears WorkOS cookies, redirects to returnTo)
  // returnTo must be a URL registered in WorkOS dashboard (App Homepage URL).
  await workosSignOut({ returnTo: process.env.NEXT_PUBLIC_APP_URL })
}
