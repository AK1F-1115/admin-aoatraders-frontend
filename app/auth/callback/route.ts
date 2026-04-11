import { handleAuth } from '@workos-inc/authkit-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { AuthExchangeResponse } from '@/types/auth.types'

/**
 * WorkOS OAuth callback route — Phase 1 auth implementation.
 *
 * Flow:
 *  1. WorkOS redirects here with ?code=...
 *  2. handleAuth() exchanges the code for a WorkOS access token internally
 *  3. onSuccess() calls POST /auth/admin/exchange with that WorkOS token
 *  4. On success: stores AOA JWT in httpOnly cookie `aoa_admin_token`, then redirects to /dashboard
 *  5. On failure (401/403/503): throws → onError() redirects to /auth/error?reason=...
 *
 * Source of truth: ADMIN_FRONTEND.md §14
 */

// Prefer API_URL (server-only) — backend URL must not appear in the client bundle.
const API_BASE =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'https://api.aoatraders.com'

export const GET = handleAuth({
  returnPathname: '/dashboard',

  onSuccess: async ({ accessToken }) => {
    // Exchange WorkOS access token for AOA admin JWT
    const res = await fetch(`${API_BASE}/auth/admin/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workos_access_token: accessToken }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      let reason: string

      // Cloudflare Bot Protection returns a managed-challenge HTML page instead of JSON.
      // Detect it and emit a clean error — raw HTML would crash decodeURIComponent on /auth/error.
      if (text.includes('_cf_chl_opt') || text.includes('Just a moment')) {
        reason = 'The backend API is currently protected by a firewall challenge and cannot be reached from the server. Please contact the AOA operations team to whitelist server-to-server requests.'
        console.error(`[auth/callback] exchange blocked by Cloudflare challenge (status ${res.status})`)
      } else {
        try {
          const body = JSON.parse(text)
          reason = body.detail ?? body.message ?? `HTTP ${res.status}`
        } catch {
          reason = text || `HTTP ${res.status}`
        }
        console.error(`[auth/callback] exchange failed: ${res.status} — ${reason}`)
      }

      throw new Error(reason)
    }

    const { access_token, expires_in } = (await res.json()) as AuthExchangeResponse

    const cookieStore = await cookies()
    cookieStore.set('aoa_admin_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: expires_in, // 86400 = 24 hours
      path: '/',
    })
  },

  onError: ({ error, request }) => {
    const reason =
      error instanceof Error
        ? error.message
        : 'An unexpected authentication error occurred'

    const url = new URL(
      `/auth/error?reason=${encodeURIComponent(reason)}`,
      request.url,
    )
    return NextResponse.redirect(url)
  },
})
