import { withAuth } from '@workos-inc/authkit-nextjs'
import { Toaster } from 'react-hot-toast'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import QueryProvider from '@/components/providers/QueryProvider'

function buildInitials(firstName?: string | null, lastName?: string | null, email?: string): string {
  const parts = [firstName, lastName].filter(Boolean) as string[]
  if (parts.length > 0) {
    return parts
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  return (email?.[0] ?? 'A').toUpperCase()
}

/**
 * Protected route group layout.
 *
 * Wraps all pages under app/(protected)/ with:
 *   - WorkOS auth guard (withAuth ensureSignedIn)
 *   - Sidebar navigation
 *   - TopBar
 *   - TanStack Query provider
 *   - react-hot-toast toaster
 *
 * Auth pages (app/auth/*) are outside this group and use the root layout only.
 */
export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user } = await withAuth({ ensureSignedIn: true })

  const userName =
    [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email
  const userInitials = buildInitials(user.firstName, user.lastName, user.email)

  return (
    <QueryProvider>
      <div className="flex h-full">
        <Sidebar userEmail={user.email} userName={userName} userInitials={userInitials} />

        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar userName={userName} userEmail={user.email} userInitials={userInitials} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
      <Toaster position="top-right" />
    </QueryProvider>
  )
}
