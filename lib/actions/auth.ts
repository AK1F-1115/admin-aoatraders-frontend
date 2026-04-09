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
 *   2. Delete aoa_admin_token cookie
 *   3. WorkOS signOut() — reads wos-session to get the proper logout URL, clears it,
 *      and redirects to WorkOS → then back to returnTo
 *
 * NOTE: do NOT manually delete wos-session before step 3. workosSignOut needs
 * it to construct the proper WorkOS logout URL. If it is missing, workosSignOut
 * skips server-side session termination and redirects straight to returnTo,
 * leaving the WorkOS session alive and causing OAuth state mismatch on re-login.
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

  // 2. Delete the AOA cookie
  cookieStore.delete('aoa_admin_token')

  // 3. Terminate the WorkOS session.
  //    workosSignOut reads wos-session, calls the WorkOS logout endpoint,
  //    clears the session cookie, and redirects to returnTo.
  //    returnTo must be a URL registered in WorkOS dashboard (App Homepage URL).
  await workosSignOut({ returnTo: process.env.NEXT_PUBLIC_APP_URL })
}
