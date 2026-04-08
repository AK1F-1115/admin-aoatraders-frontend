'use server'

import { signOut as workosSignOut } from '@workos-inc/authkit-nextjs'
import { cookies } from 'next/headers'

/**
 * Sign-out server action.
 *
 * 1. Clears the AOA admin JWT cookie (`aoa_admin_token`)
 * 2. Delegates to WorkOS signOut() which:
 *    - Clears the WorkOS session cookie (`wos-session`)
 *    - Redirects to the WorkOS logout URL → then to /auth/login
 */
export async function signOut() {
  const cookieStore = await cookies()
  // Clear the AOA admin JWT
  cookieStore.delete('aoa_admin_token')
  // Also clear the WorkOS session cookie locally so that if WorkOS logout
  // fails to redirect back cleanly, the browser has no stale session cookie
  // that would cause "OAuth state mismatch" on the next sign-in attempt.
  cookieStore.delete('wos-session')
  // returnTo must be a URL registered in WorkOS dashboard (App Homepage URL).
  // Using the root URL is the safest — it then gets redirected to /auth/login
  // by the proxy since no session exists.
  await workosSignOut({ returnTo: process.env.NEXT_PUBLIC_APP_URL })
}
