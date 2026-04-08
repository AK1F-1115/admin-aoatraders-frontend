'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  BarChart3,
  CreditCard,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  ShoppingCart,
  Store,
  Tags,
  X,
} from 'lucide-react'
import { signOut } from '@/lib/actions/auth'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/stores', label: 'Stores', icon: Store },
  { href: '/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/billing', label: 'Billing', icon: CreditCard },
  { href: '/sync', label: 'Sync', icon: RefreshCw },
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

  const navContent = (
    <nav className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border">
        <span className="text-lg font-bold tracking-tight">AOA Admin</span>
      </div>

      {/* Nav links */}
      <ul className="flex-1 py-4 space-y-0.5 px-3 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>

      {/* User + sign out */}
      <div className="border-t border-border p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
            {userInitials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{userName}</p>
            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
          </div>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            Sign Out
          </button>
        </form>
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
