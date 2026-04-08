import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.aoatraders.com'

/**
 * Core fetch wrapper for all AOA admin API calls.
 * - Reads the AOA JWT from the `aoa_admin_token` httpOnly cookie
 * - Attaches it as `Authorization: Bearer <token>`
 * - Throws on non-2xx (with the backend `detail` message when available)
 * - On 401 from the backend: clears the cookie and redirects to /auth/login
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

  // Expired / invalid session — clear cookie and boot to login
  if (res.status === 401) {
    cookieStore.delete('aoa_admin_token')
    redirect('/auth/login')
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
