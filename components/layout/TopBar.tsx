interface TopBarProps {
  userName: string
  userEmail: string
  userInitials: string
}

/**
 * Top navigation bar — shows the current user's identity.
 * Receives user data as props from the protected layout server component.
 * Rendered server-side; no client interactivity needed here.
 */
export default function TopBar({ userName, userEmail, userInitials }: TopBarProps) {
  return (
    <header className="h-14 shrink-0 border-b border-border bg-background flex items-center justify-between px-6 pl-14 md:pl-6">
      {/* Left: visible on mobile where sidebar is hidden */}
      <span className="text-sm font-semibold text-foreground md:hidden">AOA Admin</span>

      {/* Right: user identity */}
      <div className="ml-auto flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-foreground leading-tight">{userName}</p>
          <p className="text-xs text-muted-foreground leading-tight">{userEmail}</p>
        </div>
        <div
          className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0"
          aria-hidden="true"
        >
          {userInitials}
        </div>
      </div>
    </header>
  )
}
