'use client'

import SyncTriggerButton from '@/components/common/SyncTriggerButton'
import { triggerEssendantSync, triggerShopifySync } from '@/lib/actions/sync'

/**
 * Global sync trigger controls — shown at the top of the Sync page.
 * Uses existing SyncTriggerButton + server actions.
 */
export default function GlobalSyncControls() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <SyncTriggerButton
        action={triggerEssendantSync}
        label="Run Essendant Sync"
        className="bg-primary text-primary-foreground border-primary hover:bg-primary/90"
      />
      <SyncTriggerButton
        action={triggerShopifySync}
        label="Run Shopify Push"
      />
    </div>
  )
}
