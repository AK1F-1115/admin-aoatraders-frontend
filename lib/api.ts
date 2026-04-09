import { cookies } from 'next/headers'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.aoatraders.com'

/**
 * Typed sentinel thrown when the backend returns 401.
 * Callers that wrap apiRequest in Promise.allSettled must re-throw this
 * so the Next.js redirect() can propagate correctly.
 */
export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized')
    this.name = 'UnauthorizedError'
  }
}

/**
 * Re-throw any error that must not be swallowed (Next.js redirect / notFound internals
 * and our own UnauthorizedError). Call this in the catch/rejected branch of
 * Promise.allSettled to ensure redirects always propagate.
 */
export function rethrowFatalErrors(err: unknown): void {
  if (isRedirectError(err)) throw err
  if (err instanceof UnauthorizedError) throw err
}

/**
 * Core fetch wrapper for all AOA admin API calls.
 * - Reads the AOA JWT from the `aoa_admin_token` httpOnly cookie
 * - Attaches it as `Authorization: Bearer <token>`
 * - Throws on non-2xx (with the backend `detail` message when available)
 * - On 401: clears the cookie and throws UnauthorizedError (do NOT call redirect()
 *   here — redirect() throws NEXT_REDIRECT which Promise.allSettled will swallow)
 */
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const cookieStore = await cookies()
  const token = cookieStore.get('aoa_admin_token')?.value

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  // Expired / invalid session — clear cookie and signal to caller
  if (res.status === 401) {
    cookieStore.delete('aoa_admin_token')
    throw new UnauthorizedError()
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const message = (body as { detail?: string }).detail ?? `HTTP ${res.status}`
    console.error(`[api] ${options.method ?? 'GET'} ${path} → ${res.status}:`, message)
    throw new Error(message)
  }

  // 204 No Content
  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}
