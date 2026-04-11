'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart3,
  CreditCard,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Menu,
  Monitor,
  PanelLeftClose,
  PanelLeftOpen,
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
  const [collapsed, setCollapsed] = useState(false)

  // Persist collapse preference across page loads
  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed')
    if (stored === 'true') setCollapsed(true)
  }, [])

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      localStorage.setItem('sidebar-collapsed', String(!prev))
      return !prev
    })
  }

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
      {/* Logo — h-14 matches the TopBar height exactly */}
      <div
        className={`h-14 shrink-0 border-b border-sidebar-border flex items-center justify-between bg-linear-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-transparent transition-[padding] duration-200 ${
          collapsed ? 'px-3' : 'px-4'
        }`}
      >
        <div className={`flex items-center gap-2.5 min-w-0 ${collapsed ? 'w-full justify-center' : ''}`}>
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-primary-foreground text-xs font-bold tracking-tight">A</span>
          </div>
          {!collapsed && (
            <span className="text-base font-bold tracking-tight text-foreground truncate">
              AOA Admin
            </span>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={toggleCollapsed}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0 ml-2"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav links */}
      <ul className={`flex-1 py-4 space-y-0.5 overflow-y-auto ${collapsed ? 'px-2' : 'px-3'}`}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          const showAlert = href === '/system' && systemAlert
          return (
            <li key={href} className="relative">
              <Link
                href={href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? label : undefined}
                className={`flex items-center rounded-md text-sm font-medium transition-colors ${
                  collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2'
                } ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {!collapsed && <span className="flex-1">{label}</span>}
                {!collapsed && showAlert && (
                  <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" aria-label="System alert" />
                )}
              </Link>
              {/* Alert dot on icon when collapsed */}
              {collapsed && showAlert && (
                <span
                  className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 pointer-events-none"
                  aria-label="System alert"
                />
              )}
            </li>
          )
        })}
      </ul>

      {/* User + sign out + theme toggle */}
      <div className="border-t border-sidebar-border p-3">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div
              className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground ring-2 ring-primary/20"
              title={`${userName} · ${userEmail}`}
            >
              {userInitials}
            </div>
            <button
              onClick={toggleCollapsed}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
            <ThemeToggle />
          </div>
        ) : (
          <div className="space-y-3">
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
        )}
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

      {/* Mobile drawer — always full width, no collapse */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-background border-r border-border transition-transform duration-200 md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navigation"
      >
        {navContent}
      </aside>

      {/* Desktop sidebar — animates between w-64 and w-16 */}
      <aside
        className={`hidden md:flex shrink-0 flex-col bg-background border-r border-border transition-[width] duration-200 overflow-hidden ${
          collapsed ? 'w-16' : 'w-64'
        }`}
        aria-label="Navigation"
      >
        {navContent}
      </aside>
    </>
  )
}
