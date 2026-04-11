/**
 * Mapping types — field names confirmed from live API.
 *
 * Spec: GET /admin/mappings — supplier SKU → Shopify variant mappings used in sync
 *       PATCH /admin/mappings/{id} — update active state
 */
export interface Mapping {
  id: number
  supplier: string
  supplier_sku: string
  shopify_variant_id: string
  inventory_item_id: string
  location_id: string
  active: boolean
  last_synced_quantity: number | null
  created_at: string
  updated_at: string
}

export interface UpdateMappingBody {
  active?: boolean
}

/** Parsed response including server-side pagination metadata (if present). */
export interface MappingsResponse {
  items: Mapping[]
  /** True total from the server (may be larger than items.length if capped). */
  total: number
  /** Pagination params the server recognised (for debugging). */
  meta: Record<string, unknown>
}
