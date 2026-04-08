import { redirect } from 'next/navigation'

/**
 * Root route — always redirects to /dashboard.
 * Protected by WorkOS AuthKit middleware.
 */
export default function RootPage() {
  redirect('/dashboard')
}

