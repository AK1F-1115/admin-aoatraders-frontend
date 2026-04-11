import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Generic proxy for NON-admin paths (e.g. GET /billing/plans).
 *
 * Security:
 *  - Requires valid aoa_admin_token cookie (same as the admin proxy).
 *  - ALLOWLISTED paths only — only prefixes in ALLOWED_PREFIXES are forwarded.
 *    This prevents this route from becoming a generic SSRF vector into the backend.
 *  - Path traversal blocked — any '..' segment is rejected before allowlist check.
 *
 * To add a new non-admin endpoint, add its path prefix to ALLOWED_PREFIXES.
 */

// Allowed path prefixes (first segment match — no wildcards needed)
const ALLOWED_PREFIXES = new Set(['billing'])

// Prefer API_URL (server-only) so the backend URL is not in the client bundle.
const API_BASE =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'https://api.aoatraders.com'

type Context = { params: Promise<{ path: string[] }> }

async function handler(req: NextRequest, context: Context): Promise<NextResponse> {
  const { path } = await context.params
  const cookieStore = await cookies()
  const token = cookieStore.get('aoa_admin_token')?.value

  if (!token) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
  }

  // Block path traversal
  if (path.some((segment) => segment === '..')) {
    return NextResponse.json({ detail: 'Bad Request' }, { status: 400 })
  }

  // Allowlist check — only forward requests to known-safe path prefixes
  const firstSegment = path[0] ?? ''
  if (!ALLOWED_PREFIXES.has(firstSegment)) {
    return NextResponse.json({ detail: 'Not Found' }, { status: 404 })
  }

  const pathStr = path.join('/')
  const search = req.nextUrl.search
  // No /admin/ prefix — forward the path exactly as received
  const upstream = `${API_BASE}/${pathStr}${search}`

  const init: RequestInit = {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = await req.text()
  }

  const res = await fetch(upstream, init)

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 })
  }

  const data = await res.json().catch(() => null)
  return NextResponse.json(data, { status: res.status })
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const DELETE = handler
export const PATCH = handler
