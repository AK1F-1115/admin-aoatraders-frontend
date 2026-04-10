import type { Store } from '@/types/store.types'
import StatusBadge from '@/components/common/StatusBadge'
import { stripShopifyDomain, formatRelativeTime } from '@/lib/utils'

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between py-3 border-b last:border-0">
      <span className="text-sm text-muted-foreground w-48 shrink-0">{label}</span>
      <span className="text-sm font-medium text-right">{children}</span>
    </div>
  )
}

function Chip({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Yes</span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">No</span>
  )
}

export default function OverviewTab({ store }: { store: Store }) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <Row label="Shop Domain">{store.shop_domain}</Row>
      <Row label="Display Name">{stripShopifyDomain(store.shop_domain)}</Row>
      <Row label="Subscription Plan">
        <StatusBadge
          status={store.subscription_plan?.slug ?? 'free'}
          label={store.subscription_plan?.name ?? 'Free'}
        />
      </Row>
      <Row label="Subscription Status">
        <StatusBadge status={store.subscription_status} />
      </Row>
      <Row label="Store Active">
        <Chip active={store.active} />
      </Row>
      <Row label="Active Products">{store.active_product_count.toLocaleString()}</Row>
      <Row label="Location ID">{store.location_id ?? <span className="text-muted-foreground">—</span>}</Row>
      <Row label="Collections Bootstrapped">
        <Chip active={store.collections_bootstrapped} />
      </Row>
      <Row label="Shipping Profiles Bootstrapped">
        <Chip active={store.shipping_profiles_bootstrapped} />
      </Row>
      <Row label="Installed At">{new Date(store.installed_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}</Row>
      <Row label="Last Sync">{formatRelativeTime(store.last_sync_at)}</Row>
    </div>
  )
}
