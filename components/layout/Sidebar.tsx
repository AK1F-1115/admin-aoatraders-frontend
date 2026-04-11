'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart3,
  CreditCard,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Menu,
  Monitor,
  RefreshCw,
  ShoppingCart,
  Store,
  Tags,
  X,
} from 'lucide-react'
import { signOut } from '@/lib/actions/auth'
import { clientApiRequest } from '@/lib/clientApi'
import type { SystemHealth } from '@/types/system.types'
import { minutesSince } from '@/lib/utils'
import { ThemeToggle } from '@/components/common/ThemeToggle'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/stores', label: 'Stores', icon: Store },
  { href: '/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/billing', label: 'Billing', icon: CreditCard },
  { href: '/sync', label: 'Sync', icon: RefreshCw },
  { href: '/system', label: 'System', icon: Monitor },
  { href: '/price-plans', label: 'Price Plans', icon: Tags },
  { href: '/mappings', label: 'Mappings', icon: GitBranch },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
] as const

interface SidebarProps {
  userEmail: string
  userName: string
  userInitials: string
}

export default function Sidebar({ userEmail, userName, userInitials }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Poll system health for the red dot alert indicator on the System nav item
  const { data: systemHealth } = useQuery({
    queryKey: ['system', 'health'],
    queryFn: () => clientApiRequest<SystemHealth>('/admin/system'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  })
  const systemAlert =
    systemHealth != null &&
    (systemHealth.sync_errors_24h > 0 ||
      minutesSince(systemHealth.cron_last_run?.started_at) > 90)

  const navContent = (
    <nav className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-sidebar-border bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-transparent">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-primary-foreground text-xs font-bold tracking-tight">A</span>
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">AOA Admin</span>
        </div>
      </div>

      {/* Nav links */}
      <ul className="flex-1 py-4 space-y-0.5 px-3 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          const showAlert = href === '/system' && systemAlert
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="flex-1">{label}</span>
                {showAlert && (
                  <span
                    className="h-2 w-2 rounded-full bg-red-500 shrink-0"
                    aria-label="System alert"
                  />
                )}
              </Link>
            </li>
          )
        })}
      </ul>

      {/* User + sign out + theme toggle */}
      <div className="border-t border-border p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground shrink-0 ring-2 ring-primary/20">
            {userInitials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{userName}</p>
            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <form action={signOut} className="flex-1">
            <button
              type="submit"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
              Sign Out
            </button>
          </form>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="fixed top-3 left-3 z-50 md:hidden p-2 rounded-md bg-background border border-border shadow-sm"
        onClick={() => setMobileOpen((o) => !o)}
        aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-background border-r border-border transition-transform duration-200 md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navigation"
      >
        {navContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex w-64 shrink-0 flex-col bg-background border-r border-border"
        aria-label="Navigation"
      >
        {navContent}
      </aside>
    </>
  )
}
