'use client'

import { useState, useTransition } from 'react'
import toast from 'react-hot-toast'
import SyncTriggerButton from '@/components/common/SyncTriggerButton'
import ConfirmModal from '@/components/common/ConfirmModal'
import {
  syncRetail,
  syncVds,
  syncPrices,
  syncInventory,
  syncStatus,
  bootstrapCollections,
  registerWebhooks,
  resetShipping,
  deactivateStore,
} from '@/lib/actions/store'
import { stripShopifyDomain } from '@/lib/utils'

interface ActionsTabProps {
  storeId: number
  shopDomain: string
  isActive: boolean
}

export default function ActionsTab({ storeId, shopDomain, isActive }: ActionsTabProps) {
  const [showDeactivate, setShowDeactivate] = useState(false)
  const [deactivating, startDeactivate] = useTransition()

  const SYNC_ACTIONS = [
    { label: 'Sync Retail Products', action: () => syncRetail(storeId) },
    { label: 'Sync VDS Products', action: () => syncVds(storeId) },
    { label: 'Sync Prices', action: () => syncPrices(storeId) },
    { label: 'Sync Inventory', action: () => syncInventory(storeId) },
    { label: 'Sync Status', action: () => syncStatus(storeId) },
    { label: 'Bootstrap Collections', action: () => bootstrapCollections(storeId) },
    { label: 'Register Webhooks', action: () => registerWebhooks(storeId) },
    { label: 'Reset Shipping', action: () => resetShipping(storeId) },
  ]

  function handleDeactivate() {
    startDeactivate(async () => {
      try {
        await deactivateStore(storeId)
        toast.success('Store deactivated')
        setShowDeactivate(false)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to deactivate store')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Sync actions grid */}
      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="text-sm font-semibold mb-4">Sync Actions</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Each action queues a background task. You will see a "Queued ✓" confirmation when the
          task has been accepted (202).
        </p>
        <div className="flex flex-wrap gap-3">
          {SYNC_ACTIONS.map(({ label, action }) => (
            <SyncTriggerButton key={label} label={label} action={action} />
          ))}
        </div>
      </section>

      {/* Danger zone */}
      {isActive && (
        <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <h3 className="text-sm font-semibold text-destructive mb-2">Danger Zone</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Deactivating the store will stop all syncs and suspend access for the merchant.
          </p>
          <button
            type="button"
            onClick={() => setShowDeactivate(true)}
            className="rounded-md border border-destructive/50 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            Deactivate Store
          </button>
        </section>
      )}

      {showDeactivate && (
        <ConfirmModal
          open={showDeactivate}
          title="Deactivate Store"
          description={`Type the store domain to confirm deactivation:`}
          confirmText={stripShopifyDomain(shopDomain)}
          onConfirm={handleDeactivate}
          onClose={() => setShowDeactivate(false)}
          loading={deactivating}
        />
      )}
    </div>
  )
}
