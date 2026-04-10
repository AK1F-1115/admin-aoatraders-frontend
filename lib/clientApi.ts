/**
 * Client-safe API request helper for use inside Client Components and TanStack Query hooks.
 *
 * Sends requests to the Next.js proxy route at /api/admin/* rather than directly
 * to the external API. The proxy route handler runs server-side, reads the httpOnly
 * aoa_admin_token cookie, and forwards the request with the Authorization header.
 *
 * Usage:
 *   import { clientApiRequest } from '@/lib/clientApi'
 *   const data = await clientApiRequest<SystemHealth>('/admin/system')
 */
export async function clientApiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  // Strip the /admin prefix if caller includes it, then route through the proxy
  const proxyPath = path.startsWith('/admin') ? path.slice('/admin'.length) : path
  const res = await fetch(`/api/admin${proxyPath}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (res.status === 401) {
    // /auth/reset clears stale aoa_admin_token + WorkOS cookies, then redirects to /
    // where the proxy middleware initiates a fresh WorkOS PKCE flow.
    window.location.href = '/auth/reset'
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const message = (body as { detail?: string }).detail ?? `HTTP ${res.status}`
    throw new Error(message)
  }

  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}
