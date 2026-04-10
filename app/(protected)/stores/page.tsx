import { redirect } from 'next/navigation'
import { apiRequest, UnauthorizedError } from '@/lib/api'
import type { Store } from '@/types/store.types'
import type { PaginatedResponse } from '@/types/api.types'
import StoreTable from '@/components/stores/StoreTable'

export default async function StoresPage() {
  let stores: Store[] = []

  try {
    // per_page=200 to load all stores for client-side filtering
    // Handle both a plain array and a paginated envelope from the API
    const raw = await apiRequest<Store[] | PaginatedResponse<Store>>(
      '/admin/stores?per_page=200',
    )
    stores = Array.isArray(raw) ? raw : (raw.items ?? [])
  } catch (err) {
    if (err instanceof UnauthorizedError) redirect('/auth/login')
    // Non-fatal — render empty state
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
