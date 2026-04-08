/**
 * Generic API response shapes and error types for the AOA Traders Admin.
 * All backend responses follow these envelope patterns.
 */

/** Standard paginated list response from FastAPI */
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  pages: number
}

/** Standard single-item response */
export interface SingleResponse<T> {
  data: T
}

/** 202 Accepted response for background/sync tasks */
export interface AcceptedResponse {
  message: string
  task_id?: string
}

/**
 * Typed application error — thrown by apiRequest() on non-2xx responses.
 * Contains the backend `detail` field when available.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

/** All possible order statuses */
export type OrderStatus =
  | 'pending_purchase'
  | 'purchased'
  | 'fulfillment_sent'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

/** All possible store subscription statuses */
export type StoreStatus = 'active' | 'pending' | 'cancelled' | 'free'

/** Sync type identifiers */
export type SyncType = 'retail' | 'vds' | 'prices' | 'inventory' | 'status'
