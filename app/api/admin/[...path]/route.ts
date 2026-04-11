import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Generic proxy route handler for all /api/admin/* paths.
 *
 * Allows client components to call backend endpoints without accessing
 * httpOnly cookies from JavaScript. The route handler runs server-side,
 * reads the aoa_admin_token cookie, and forwards the request to the
 * upstream API with the Authorization header attached.
 *
 * Client components call: /api/admin/system  →  API_BASE/admin/system
 * Client components call: /api/admin/stores/3/webhooks  →  API_BASE/admin/stores/3/webhooks
 *
 * Security: path traversal blocked — any segment equal to '..' is rejected.
 */

// Prefer API_URL (server-only) so the backend URL is not embedded in the client bundle.
// Fall back to NEXT_PUBLIC_API_URL for environments that only set the public var.
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

  // Block path traversal — reject any segment that is '..'
  if (path.some((segment) => segment === '..')) {
    return NextResponse.json({ detail: 'Bad Request' }, { status: 400 })
  }

  const pathStr = path.join('/')
  const search = req.nextUrl.search
  const upstream = `${API_BASE}/admin/${pathStr}${search}`

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
