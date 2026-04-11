/**
 * Mapping types — field names TBD, confirmed via console.log on first page load.
 * Update this interface once real field names are known from the live API.
 *
 * Spec: GET /admin/mappings — editable category/brand → mapping value pairs
 *       PATCH /admin/mappings/{id} — update active state or variant_ids
 */
export interface Mapping {
  id: number
  // Field names TBD — will be confirmed from console.log in useMappings.ts
  // Likely candidates: type, name/source, value/mapped_to, active, variant_ids, etc.
  [key: string]: unknown
}

export interface UpdateMappingBody {
  active?: boolean
  variant_ids?: number[]
  // Other fields TBD after field name discovery
  [key: string]: unknown
}
