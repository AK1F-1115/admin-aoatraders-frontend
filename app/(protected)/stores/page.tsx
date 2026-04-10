import { redirect } from 'next/navigation'
import { apiRequest, UnauthorizedError } from '@/lib/api'
import type { Store } from '@/types/store.types'
import StoreTable from '@/components/stores/StoreTable'

export default async function StoresPage() {
  let stores: Store[] = []

  try {
    stores = await apiRequest<Store[]>('/admin/stores')
  } catch (err) {
    if (err instanceof UnauthorizedError) redirect('/auth/login')
    // Non-fatal — render empty state with error notice
  }

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Stores</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All connected merchant stores
        </p>
      </div>
      <StoreTable stores={stores} />
    </div>
  )
}
