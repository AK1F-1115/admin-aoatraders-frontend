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
  cookieStore.delete('aoa_admin_token')
  // WorkOS signOut handles the redirect — no return value needed
  await workosSignOut()
}
