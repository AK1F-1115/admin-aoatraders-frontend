import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Generic proxy for NON-admin paths (e.g. GET /billing/plans).
 *
 * Unlike /api/admin/[...path] which prepends `/admin/` on the upstream URL,
 * this route forwards the path verbatim so that:
 *   /api/proxy/billing/plans  →  API_BASE/billing/plans
 *
 * Still requires a valid aoa_admin_token so the upstream can verify the caller.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.aoatraders.com'

type Context = { params: Promise<{ path: string[] }> }

async function handler(req: NextRequest, context: Context): Promise<NextResponse> {
  const { path } = await context.params
  const cookieStore = await cookies()
  const token = cookieStore.get('aoa_admin_token')?.value

  if (!token) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
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
