import { getSignInUrl } from '@workos-inc/authkit-nextjs'
import { redirect } from 'next/navigation'

/**
 * Login page — redirects to the WorkOS hosted sign-in page.
 * This page is hit when:
 *  - A user navigates directly to /auth/login
 *  - lib/api.ts receives a 401 and clears the aoa_admin_token cookie
 */
export default async function LoginPage() {
  const signInUrl = await getSignInUrl({ returnTo: '/dashboard' })
  redirect(signInUrl)
}
