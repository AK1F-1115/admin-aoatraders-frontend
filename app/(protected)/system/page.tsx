import { Monitor } from 'lucide-react'
import SystemClient from '@/components/system/SystemClient'

export default function SystemPage() {
  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Monitor className="h-6 w-6" aria-hidden="true" />
          System Console
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Server health, cron status, and live log viewer. Auto-refreshes every 60s.
        </p>
      </div>
      <SystemClient />
    </div>
  )
}
