'use client'

import { useState } from 'react'
import type { Store } from '@/types/store.types'
import type { BillingPlan } from '@/types/billing.types'
import OverviewTab from '@/components/stores/tabs/OverviewTab'
import ConfigTab from '@/components/stores/tabs/ConfigTab'
import ActionsTab from '@/components/stores/tabs/ActionsTab'
import WebhooksTab from '@/components/stores/tabs/WebhooksTab'
import { stripShopifyDomain } from '@/lib/utils'
import StatusBadge from '@/components/common/StatusBadge'

const TABS = ['Overview', 'Configuration', 'Actions', 'Webhooks'] as const
type Tab = typeof TABS[number]

interface StoreDetailClientProps {
  store: Store
  plans: BillingPlan[]
}

export default function StoreDetailClient({ store, plans }: StoreDetailClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview')

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {stripShopifyDomain(store.shop_domain)}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{store.shop_domain}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge
            status={store.subscription_plan_slug ?? 'free'}
            label={store.subscription_plan_name ?? 'Free'}
          />
          <StatusBadge
            status={store.active ? 'active' : 'cancelled'}
            label={store.active ? 'Active' : 'Inactive'}
          />
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {activeTab === 'Overview' && <OverviewTab store={store} />}
      {activeTab === 'Configuration' && <ConfigTab store={store} plans={plans} />}
      {activeTab === 'Actions' && (
        <ActionsTab
          storeId={store.id}
          shopDomain={store.shop_domain}
          isActive={store.active}
        />
      )}
      {activeTab === 'Webhooks' && <WebhooksTab storeId={store.id} />}
    </div>
  )
}
