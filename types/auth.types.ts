/**
 * Auth exchange types for AOA Traders Admin.
 * Source of truth: ADMIN_FRONTEND.md §3 + §14
 */

/** Response from POST /auth/admin/exchange */
export interface AuthExchangeResponse {
  access_token: string
  expires_in: number
  user: AdminUser
}

/** AOA admin user returned by the exchange endpoint */
export interface AdminUser {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: 'admin'
}
