# AOA Traders Admin Frontend — Architecture

> **Single source of truth for frontend system design.**
> Last updated: 2026-04-07 (revised after ADMIN_FRONTEND.md v2 — all backend endpoints now live)
> Status: 🏗️ Foundation — Pre-scaffold
> Target domain: `admin.aoatraders.com`
> Backend API: `https://api.aoatraders.com`

---

## 📋 Table of Contents

1. [Tech Stack](#tech-stack)
2. [Full Project Structure](#full-project-structure)
3. [Page Hierarchy](#page-hierarchy)
4. [Component Organization](#component-organization)
5. [API Layer Design](#api-layer-design)
6. [Data Flow](#data-flow)
7. [State Management Strategy](#state-management-strategy)
8. [Auth Flow](#auth-flow)
9. [Routing Structure](#routing-structure)
10. [Environment & Configuration](#environment--configuration)
11. [Security Architecture](#security-architecture)
12. [Error Handling Architecture](#error-handling-architecture)
13. [Multi-Tenant Design](#multi-tenant-design)
14. [Backend Prerequisites](#backend-prerequisites)

---

## 🛠 Tech Stack

| Layer              | Technology                                   | Purpose                                        |
|--------------------|----------------------------------------------|------------------------------------------------|
| Framework          | **Next.js 15** (App Router, TypeScript)      | SSR/SSG, file-based routing, middleware        |
| Auth               | **WorkOS AuthKit** (`@workos-inc/authkit-nextjs`) | Hosted login, session, Next.js middleware |
| UI Components      | **shadcn/ui** + Tailwind CSS                 | Accessible headless components + utility CSS   |
| Server State       | **TanStack React Query v5** (`@tanstack/react-query`) | API data fetching, caching, mutations  |
| Tables             | **TanStack Table v8** (`@tanstack/react-table`) | Sortable, filterable, paginated tables      |
| Forms              | **React Hook Form + Zod**                    | Type-safe validated forms                      |
| Charts             | **Recharts**                                 | Analytics visualisations                       |
| Icons              | **Lucide React**                             | Consistent icon set                            |
| HTTP Client        | **Native `fetch`** (via `lib/api.ts` wrapper) | Authenticated API calls — no Axios            |
| Notifications      | **react-hot-toast**                          | Toast feedback for all operations              |
| Date Handling      | **date-fns**                                 | Safe, immutable date operations                |
| Hosting            | **Vercel** (recommended) or DO static export | Production deployment                          |
| Linting            | ESLint + Prettier                            | Code quality                                   |
| Testing            | Vitest + React Testing Library               | Unit + integration tests                       |

> ⚠️ **Framework correction from initial design:** This project uses **Next.js 15 App Router**, NOT Vite + React Router. All routing is file-system based under `app/`. There is no `react-router-dom` dependency.

---

## 📁 Full Project Structure

```
admin-aoatraders-frontend/
├── app/                                    # Next.js App Router root
│   ├── layout.tsx                          # Root layout — sidebar + topbar shell
│   ├── page.tsx                            # Redirect → /dashboard
│   ├── dashboard/
│   │   └── page.tsx                        # Platform overview
│   ├── stores/
│   │   ├── page.tsx                        # Store list
│   │   └── [id]/
│   │       └── page.tsx                    # Store detail (3-tab: overview, config, actions)
│   ├── orders/
│   │   ├── page.tsx                        # Order queue
│   │   └── [id]/
│   │       └── page.tsx                    # Order detail + status management
│   ├── billing/
│   │   └── page.tsx                        # Billing overview + plan assignment
│   ├── sync/
│   │   └── page.tsx                        # Sync monitor + manual trigger controls
│   ├── price-plans/
│   │   └── page.tsx                        # AOA internal markup tier management
│   ├── mappings/
│   │   └── page.tsx                        # Category/brand mapping editor
│   ├── analytics/
│   │   └── page.tsx                        # Platform-wide profitability analytics
│   └── auth/
│       └── callback/
│           └── page.tsx                    # WorkOS OAuth callback handler
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx                     # Navigation with active route highlight
│   │   └── TopBar.tsx                      # Header with user avatar + store context
│   ├── ui/                                 # shadcn/ui auto-generated components
│   ├── common/
│   │   ├── StatusBadge.tsx                 # Colour-coded status chip (orders + stores)
│   │   ├── SyncTriggerButton.tsx           # POST → loading → "Queued ✓" pattern
│   │   ├── ConfirmModal.tsx                # Destructive action confirmation dialog
│   │   ├── LoadingSpinner.tsx
│   │   ├── EmptyState.tsx
│   │   ├── DataTable.tsx                   # Generic TanStack Table wrapper
│   │   └── Pagination.tsx
│   ├── stores/
│   │   ├── StoreTable.tsx                  # Store list with TanStack Table
│   │   ├── StoreDetailTabs.tsx             # Tab container: Overview / Config / Actions
│   │   ├── StoreConfigForm.tsx             # React Hook Form + Zod for PATCH /admin/stores/{id}
│   │   └── StoreSyncActions.tsx            # Action buttons panel (Tab 3)
│   ├── orders/
│   │   ├── OrderTable.tsx                  # Order queue table
│   │   ├── OrderDetail.tsx                 # Full order layout
│   │   └── OrderStatusPanel.tsx            # Status transitions sidebar
│   └── analytics/
│       ├── KpiCard.tsx                     # Metric summary card
│       ├── OrdersOverTimeChart.tsx         # Recharts line/bar combo
│       ├── StorePerformanceTable.tsx       # Per-store analytics table
│       └── TopProductsTable.tsx            # Top products by margin
│
├── lib/
│   ├── api.ts                              # fetch wrapper — attaches JWT, handles errors
│   └── queries/                            # TanStack Query hooks
│       ├── useStores.ts
│       ├── useOrders.ts
│       ├── useBilling.ts
│       ├── useSync.ts
│       ├── usePricePlans.ts
│       ├── useMappings.ts
│       └── useAnalytics.ts
│
├── types/
│   ├── store.types.ts
│   ├── order.types.ts
│   ├── billing.types.ts
│   ├── sync.types.ts
│   ├── analytics.types.ts
│   └── api.types.ts                        # Generic API response shapes + AppError
│
├── utils/
│   ├── format.ts                           # formatDomain(), formatMarkup(), formatCurrency()
│   ├── validation.ts                       # Zod schemas for all forms
│   └── sanitize.ts                         # Output sanitization helpers
│
├── middleware.ts                           # WorkOS AuthKit middleware (protects all routes)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.example
├── package.json
├── ARCHITECTURE.md                         # ← This file
├── TODO.md
├── TODOCOMPLETED.md
└── claude.md
```

---

## 📄 Page Hierarchy

> Source of truth: `ADMIN_FRONTEND.md` Section 4

```
admin.aoatraders.com/
│
├── /                           → Redirect to /dashboard
├── /auth/callback              → WorkOS OAuth callback (public — excluded from middleware)
│
└── (protected by WorkOS AuthKit middleware)
    ├── /dashboard              → Platform overview (metrics, sync health, recent orders)
    ├── /stores                 → All merchant stores — list, filter, search
    │   └── /stores/[id]        → Store detail — 3 tabs: Overview | Config | Actions
    ├── /orders                 → Cross-store order queue
    │   └── /orders/[id]        → Full order + line items + status management
    ├── /billing                → Plan assignment + MRR overview + plan distribution
    ├── /sync                   → Sync pipeline monitor + manual trigger controls
    ├── /price-plans            → AOA internal markup tier management
    ├── /mappings               → Category/brand mapping editor
    └── /analytics              → Platform-wide profitability analytics (blocked on backend)
```

### Pages not present in this admin app
- No "Products" management page — products are pushed via sync, not managed directly
- No "Customers" page — customer data lives in Shopify; AOA views via orders only
- No "Settings" page — store-level settings are handled inside `/stores/[id]` Config tab

---

## 🧩 Component Organization

### Rules (from `claude.md` + `admin.frontend.instructions.md`)

- Every component **< 50 lines**
- **Single responsibility** — one job per component
- **No business logic** in UI components — business logic lives in hooks (`lib/queries/`)
- **No direct API calls** inside components — all calls go through `lib/api.ts` via query hooks
- Use **TanStack Table v8** for all data tables (not custom table markup)

### Component Layers

```
app/[route]/page.tsx          ← Next.js page (Server or Client Component)
  └── calls lib/queries/ hook for data
        └── hook calls lib/api.ts
              └── renders domain components with props
                    └── renders common/ui primitives
```

### Key Shared Components

#### `StatusBadge.tsx`
```typescript
const STATUS_COLORS = {
  // Store subscription status
  active:           'bg-green-100 text-green-800',
  pending:          'bg-yellow-100 text-yellow-800',
  cancelled:        'bg-red-100 text-red-800',
  free:             'bg-gray-100 text-gray-700',
  // Order status
  pending_purchase: 'bg-gray-100 text-gray-700',
  purchased:        'bg-blue-100 text-blue-800',
  fulfillment_sent: 'bg-purple-100 text-purple-800',
  shipped:          'bg-green-100 text-green-800',
  delivered:        'bg-green-100 text-green-800',
}
```

#### `SyncTriggerButton.tsx`
Reusable button for all sync POST endpoints:
1. Fire POST endpoint
2. Show loading spinner while in-flight
3. Show "Queued ✓" for 3 seconds on 202 response
4. Show error toast on non-2xx

#### `ConfirmModal.tsx`
Props: `title`, `description`, `confirmText`, `onConfirm`
Used for: deactivate store, cancel order, reset shipping, assign plan

### Plan Badge Colors
| Plan    | Color  |
|---------|--------|
| Free    | gray   |
| Starter | blue   |
| Growth  | purple |
| Pro     | gold   |

---

## 🌐 API Layer Design

### API Client (`lib/api.ts`)

> Uses **native `fetch`** — no Axios. Cookie `aoa_admin_token` is read and attached as a Bearer token.

```typescript
// lib/api.ts
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getCookie('aoa_admin_token')   // httpOnly cookie set by backend
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}
```

### Error Handling in API Client

| HTTP Status | Action |
|-------------|--------|
| 401 | Clear `aoa_admin_token` cookie → redirect to WorkOS login |
| 403 | Throw — page shows unauthorized state |
| 4xx | Throw with `detail` message from backend response |
| 5xx | Throw generic "Something went wrong" |

### Query Hooks Pattern (`lib/queries/`)

Each query file exports typed TanStack Query hooks:

```typescript
// lib/queries/useStores.ts
export const useStores = (filters) =>
  useQuery({ queryKey: ['stores', filters], queryFn: () => apiRequest('/admin/stores', ...) })

export const useUpdateStore = () =>
  useMutation({
    mutationFn: ({ id, data }) => apiRequest(`/admin/stores/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => { queryClient.invalidateQueries(['stores']); toast.success('Store updated') },
    onError: (err) => { toast.error(err.message); console.error(err) },
  })
```

### API URL Strategy

- Base URL: `process.env.NEXT_PUBLIC_API_URL` (e.g. `https://api.aoatraders.com`)
- **NEVER hardcoded**
- All paths are prefixed in the call (e.g. `/admin/stores`, `/billing/plans`)
- Always HTTPS in production

### Sync Endpoints — 202 Pattern

All `POST /admin/stores/{id}/sync/*` and `POST /admin/sync/*/run` return **HTTP 202** immediately.
- Frontend: show loading until 202 arrives, then show "Queued ✓" for 3 seconds
- Do **NOT** poll for completion — no webhook/callback exists yet
- Do **NOT** block UI

### Complete API Endpoint Reference

#### Stores
| Method | Path | Notes |
|--------|------|-------|
| GET | `/admin/stores` | List all stores |
| GET | `/admin/stores/{id}` | Single store detail |
| PATCH | `/admin/stores/{id}` | Update config/markups/active state |
| POST | `/admin/stores/{id}/sync/retail` | 202 — background task |
| POST | `/admin/stores/{id}/sync/vds` | 202 — background task |
| POST | `/admin/stores/{id}/sync/prices` | 202 — background task |
| POST | `/admin/stores/{id}/sync/inventory` | 202 — background task |
| POST | `/admin/stores/{id}/sync/status` | 202 — background task |
| POST | `/admin/stores/{id}/bootstrap-collections` | 202 |
| POST | `/admin/stores/{id}/register-webhooks` | 202 |
| POST | `/admin/stores/{id}/assign-plan` | `{ "plan_id": int }` |
| POST | `/admin/stores/{id}/reset-shipping` | 202 |

#### Orders
| Method | Path | Notes |
|--------|------|-------|
| GET | `/admin/orders` | Query: `page`, `per_page`, `status`, `store_id`, `search` |
| GET | `/admin/orders/{id}` | Full order + line items |
| PATCH | `/admin/orders/{id}/status` | `{ status, tracking_number? }` — cancelled triggers Stripe refund |

#### Sync
| Method | Path | Notes |
|--------|------|-------|
| GET | `/admin/sync/status` | All sync type statuses |
| POST | `/admin/sync/essendant/run` | Trigger full ICAPS ingest |
| POST | `/admin/sync/shopify/run` | Trigger full Shopify push |

#### Billing
| Method | Path | Notes |
|--------|------|-------|
| GET | `/billing/plans` | Public — no auth needed |
| GET | `/admin/price-plans` | AOA internal price plan tiers |
| PATCH | `/admin/price-plans/{id}` | Update markup tiers |
| GET | `/admin/mappings` | Category/brand mappings |
| PATCH | `/admin/mappings/{id}` | Update single mapping |

#### Analytics (✅ all live as of `2f8681d` — full contracts in `ADMIN_FRONTEND.md` §15)
| Method | Path | Notes |
|--------|------|-------|
| GET | `/admin/analytics/summary` | KPI summary for period — ⚠️ margin fields always `null` |
| GET | `/admin/analytics/stores` | Per-store breakdown — ⚠️ `margin`/`margin_pct` always `null` |
| GET | `/admin/analytics/orders-over-time` | Time series — field is `revenue`, not `margin` |
| GET | `/admin/analytics/top-products` | Top products by revenue — ⚠️ `avg_margin_pct` always `null` |

---

## 🔄 Data Flow

```
User Action
    │
    ▼
Next.js Page Component (app/[route]/page.tsx)
    │
    ▼
TanStack Query Hook  (lib/queries/use*.ts)
    │  ─── useQuery / useMutation
    ▼
API Wrapper  (lib/api.ts → apiRequest())
    │  ─── fetch + Authorization: Bearer <aoa_admin_token>
    ▼
FastAPI Backend  (api.aoatraders.com — HTTPS only)
    │  ─── Returns typed JSON response
    ▼
TanStack Query Cache  (normalised, auto-invalidated on mutation)
    │
    ▼
Component Re-render
    │
    ▼
Toast Notification  (react-hot-toast — success / error feedback)
```

### Mutation Pattern (writes)

```
useMutation → apiRequest() → backend
    ├── onSuccess → queryClient.invalidateQueries([...]) → toast.success(...)
    └── onError   → console.error(err) → toast.error(err.message)
```

### Special Case: Sync Actions (202)

```
SyncTriggerButton
    ├── onClick → apiRequest(POST /admin/...sync/...) → 202
    ├── isLoading=true → spinner shown
    ├── on 202 → isLoading=false → show "Queued ✓" for 3s
    └── on error → toast.error(...)
    ⚠️ No polling — 202 is the final frontend response
```

---

## 🗃 State Management Strategy

| State Type           | Tool                        | Location               | Examples                                      |
|----------------------|-----------------------------|------------------------|-----------------------------------------------|
| Server data          | TanStack React Query        | Query cache            | Stores, orders, billing, sync status          |
| Table state          | TanStack Table v8           | Component              | Sorting, pagination, column visibility        |
| Form state           | React Hook Form             | Component              | Store config form, order status form          |
| Local UI state       | `useState`                  | Component              | Modal open, tab selection, button loading     |
| Auth session         | WorkOS AuthKit              | Middleware + cookie    | Handled by `@workos-inc/authkit-nextjs`       |
| URL/filter state     | Next.js `searchParams`      | URL                    | Status filter, page number, search query      |

### Rules

- **Do NOT use global React Context** for data that belongs in React Query
- **Do NOT store auth state manually** — WorkOS AuthKit handles this via middleware
- **URL is the source of truth** for filters and pagination — use `searchParams`
- **Markup percentages** in DB are decimal (e.g. `0.25`). Display as `×100%`. Divide by 100 on submit.

---

## 🔐 Auth Flow

> Source of truth: `ADMIN_FRONTEND.md` Section 3

### Step-by-step

```
1. User visits admin.aoatraders.com (any protected route)
2. Next.js middleware.ts intercepts → WorkOS AuthKit checks session
3. No valid session → WorkOS AuthKit redirects to WorkOS hosted login page
4. User authenticates via WorkOS
5. WorkOS redirects to /auth/callback?code=...
6. /auth/callback page:
     a. Receives WorkOS access token
     b. Calls backend POST /auth/admin/exchange { workos_access_token }
     c. Backend verifies token, confirms AOA admin org (WORKOS_ADMIN_ORG_ID),
        signs AOA JWT { sub: email, role: admin, exp: now+86400 }
     d. Backend returns { access_token, expires_in, user }
     e. Frontend stores AOA JWT in httpOnly cookie: aoa_admin_token
7. Redirect to /dashboard
8. All subsequent API calls: Authorization: Bearer <aoa_admin_token> (from cookie)
```

### Next.js Middleware

```typescript
// middleware.ts
import { authkitMiddleware } from '@workos-inc/authkit-nextjs'

export default authkitMiddleware({
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
})

export const config = {
  matcher: ['/((?!_next|static|favicon|auth/callback).*)'],
}
```

### Auth Expiry Handling

- AOA JWT expires in **24 hours**
- If any `apiRequest()` receives **401** → clear `aoa_admin_token` cookie → redirect to `/auth/login`
- Handle this in `lib/api.ts` — not in individual query hooks

### Token Storage Rules

- **httpOnly cookie** (`aoa_admin_token`) — set by backend after WorkOS exchange
- **NEVER localStorage** / **NEVER sessionStorage** for tokens
- **NEVER** expose the token in URL params or logs

### Exchange Endpoint Error Responses

| Status | Meaning |
|--------|---------|
| `401` | Token decode failure, WorkOS user not found, or org membership check failed |
| `403` | User not in `WORKOS_ADMIN_ORG_ID` org, or not `role=admin` in AOA users table |
| `503` | WorkOS env vars not configured on server — contact AOA ops |

On 401/403: redirect to `/auth/error?reason=<detail>`. On 503: show a server configuration error page.

### ✅ Backend Status

`POST /auth/admin/exchange` is **live as of `2f8681d`**. Full implementation contract in `ADMIN_FRONTEND.md` §14.

### Sign-Out

Clear the `aoa_admin_token` httpOnly cookie and redirect to WorkOS logout URL or `/auth/login`.

---

## 🗺 Routing Structure

> **Next.js 15 App Router — file-system based routing. No React Router.**

```
app/
├── layout.tsx                          # Root layout (Sidebar + TopBar)
├── page.tsx                            # redirect() → /dashboard
├── dashboard/page.tsx                  # GET /admin/stores + /admin/sync/status + /admin/orders
├── stores/
│   ├── page.tsx                        # GET /admin/stores (list)
│   └── [id]/page.tsx                   # GET /admin/stores/{id} (detail, 3-tab)
├── orders/
│   ├── page.tsx                        # GET /admin/orders (queue)
│   └── [id]/page.tsx                   # GET /admin/orders/{id} (detail)
├── billing/page.tsx                    # GET /billing/plans + /admin/stores
├── sync/page.tsx                       # GET /admin/sync/status
├── price-plans/page.tsx                # GET /admin/price-plans
├── mappings/page.tsx                   # GET /admin/mappings
├── analytics/page.tsx                  # GET /admin/analytics/* (✅ all endpoints live — §15)
└── auth/callback/page.tsx              # POST /auth/admin/exchange (public)
```

### Sidebar Navigation Order

```
AOA Admin
─────────
Dashboard
Stores
Orders
Billing
Sync
Price Plans
Mappings
Analytics
─────────
[User avatar + email]
[Sign Out]
```

Active route is highlighted. Sidebar collapses to icon-only on mobile.

---

## ⚙️ Environment & Configuration

### `.env.example`

```env
NEXT_PUBLIC_APP_URL=https://admin.aoatraders.com
NEXT_PUBLIC_API_URL=https://api.aoatraders.com
WORKOS_CLIENT_ID=client_...
WORKOS_API_KEY=sk_...
WORKOS_REDIRECT_URI=https://admin.aoatraders.com/auth/callback
WORKOS_ADMIN_ORG_ID=org_...
```

> `WORKOS_API_KEY`, `WORKOS_REDIRECT_URI`, `WORKOS_ADMIN_ORG_ID` are **server-only** — never exposed to the browser.
> Only `NEXT_PUBLIC_*` vars are accessible in client components.

### Deployment — Vercel

- **Domain:** `admin.aoatraders.com` → Vercel deployment
- **CORS:** `https://admin.aoatraders.com` must be in backend's `ALLOWED_ORIGINS`
- **WorkOS redirect URI** must be registered in WorkOS dashboard: `https://admin.aoatraders.com/auth/callback`
- Separate deployment from the merchant app at `app.aoatraders.com`

---

## 🔒 Security Architecture

| Threat                      | Mitigation                                                              |
|-----------------------------|-------------------------------------------------------------------------|
| Token theft                 | httpOnly cookie (`aoa_admin_token`) — not accessible to browser JS      |
| XSS                         | React escaping + sanitize util + `dangerouslySetInnerHTML` never used   |
| CSRF                        | SameSite cookie policy + backend CSRF protection                        |
| Unauthorized admin access   | WorkOS org check (`WORKOS_ADMIN_ORG_ID`) — non-AOA users rejected       |
| Cross-tenant data leak       | All API responses scoped by backend — frontend never infers store data  |
| Sensitive data in URL       | IDs only — no tokens, no PII in URL params                              |
| Unvalidated inputs          | Zod schemas on all forms before submission                              |
| Unauthenticated API calls   | `lib/api.ts` always attaches Bearer token; 401 → redirect to login     |
| Hardcoded secrets           | All config via `process.env` — never in source code                     |
| Destructive actions         | `ConfirmModal` required for: deactivate store, cancel order, reset shipping, assign plan |

---

## 🚨 Error Handling Architecture

```
API Error (lib/api.ts)
  ├── 401 → clear aoa_admin_token cookie → redirect to /auth/callback (WorkOS login)
  ├── 403 → throw — page renders unauthorized state
  ├── 4xx → throw Error(detail from backend response body)
  └── 5xx → throw Error("Something went wrong")

TanStack Query onError
  └── All mutations → toast.error(err.message) + console.error(err)

Component Error
  └── Next.js error.tsx files → catch render errors → fallback UI per route segment

Async/Mutation Error
  └── useMutation onError → toast.error + console.error
```

### Rule: No Silent Failures
Every API call must have an `onError` handler. Toast + console.error is the minimum.

---

## 🏪 Multi-Tenant Design

- This is the **AOA back-office** (`admin.aoatraders.com`) — not the merchant app
- AOA staff has **full read/write access to all stores**
- All data is multi-store — every page that touches store data must scope by store
- **Every destructive action** (deactivate store, cancel order, reset shipping, assign plan) **requires a ConfirmModal** before firing the API call
- Frontend never computes cross-tenant aggregates — only backend analytics endpoints do this
- Store domain display: strip `.myshopify.com` — use `formatDomain()` utility everywhere

---

## 📐 Key Implementation Conventions

### Markup Percentage Display
- DB stores decimal: `0.25` = 25%
- Display: multiply by 100, append `%`
- On form submit: divide by 100 before sending to API
- Utility: `formatMarkup(value: number): string` in `utils/format.ts`

### Store Domain Display
- DB value: `aacee-inc.myshopify.com`
- Display: `aacee-inc`
- Utility: `formatDomain(domain: string): string` in `utils/format.ts`

### Analytics — Revenue vs Margin

> ⚠️ **Current backend limitation:** `total_aoa_cost`, `total_aoa_margin`, `avg_margin_pct`, `margin`, and `margin_pct` all return **`null`** from every analytics endpoint. AOA supplier cost is not stored at order capture time.

**What IS available and reliable:**
- `total_merchant_revenue` — what merchants paid AOA for orders (always populated). Display as **"AOA Revenue"** — not "Merchant Revenue".
- `mrr_shopify_billing` — Shopify subscription MRR (always populated)
- Order counts by status
- Per-store order counts and revenue
- Per-product order counts and revenue

**Margin formula (for future use when `total_aoa_cost` is populated):**
$$
\text{margin} = \text{total\_merchant\_revenue} - \text{total\_aoa\_cost}
$$
$$
\text{margin\_pct} = \frac{\text{margin}}{\text{total\_merchant\_revenue}} \times 100
$$

**UI rule for null margin fields:** Display `N/A` or `—`. **Do not remove margin columns** — keep layout ready. Add tooltip: "Margin tracking requires supplier cost data — coming soon."

```tsx
// Pattern for null-safe margin display
value={summary.total_aoa_margin != null ? formatCurrency(summary.total_aoa_margin) : 'N/A'}
// Pattern for null-safe margin % in tables  
{store.margin_pct != null ? `${store.margin_pct.toFixed(1)}%` : '—'}
```

**`orders-over-time` field name:** The time-series field is `revenue` (not `margin`). Fill date gaps with `0` for continuous Recharts series.

**`top-products` null SKU:** Display `aoa_sku = null` rows as "(unresolved SKU)".

### Margin % Colour Coding (Analytics)
| Range     | Colour |
|-----------|--------|
| < 15%     | Red    |
| 15–25%    | Yellow |
| > 25%     | Green  |

### Plan Assignment Side Effects
After `POST /admin/stores/{id}/assign-plan` succeeds:
- Must re-fetch `GET /admin/stores/{id}` to refresh displayed config (SKU limits change)
- Use `queryClient.invalidateQueries(['stores', id])`

---

## 🔗 Backend Prerequisites

> See `ADMIN_FRONTEND.md` §12 and §14–15 for full implementation contracts.

| # | Endpoint | Status | Notes |
|---|----------|--------|-------|
| 1 | `POST /auth/admin/exchange` | ✅ Live — `2f8681d` | Full contract in `ADMIN_FRONTEND.md` §14 |
| 2 | `GET /admin/analytics/summary` | ✅ Live — `2f8681d` | Margin fields return `null` — see §16 |
| 3 | `GET /admin/analytics/stores` | ✅ Live — `2f8681d` | `margin`/`margin_pct` return `null` |
| 4 | `GET /admin/analytics/orders-over-time` | ✅ Live — `2f8681d` | Field is `revenue` not `margin` |
| 5 | `GET /admin/analytics/top-products` | ✅ Live — `2f8681d` | `avg_margin_pct` returns `null` |
| 6 | All other `/admin/*` endpoints | ✅ Exist | — |
| 7 | `GET /billing/plans` | ✅ Exists | — |
| 8 | `GET /admin/sync/status` | ✅ Exists | — |

> **All backend prerequisites are now met.** No frontend pages are blocked on backend delivery.
> Remaining limitation: supplier cost is not tracked at order capture time — margin fields are `null` until a future backend migration adds `unit_supplier_cost` to `aoa_order_items`.

### Required Server `.env` for Auth
```env
WORKOS_API_KEY=sk_...
WORKOS_CLIENT_ID=client_...
WORKOS_ADMIN_ORG_ID=org_...
ALLOWED_ORIGINS=https://app.aoatraders.com,https://admin.aoatraders.com
```

---

*This document must be updated whenever structure, routing, or architecture changes.*
*Any deviation from this document requires explicit discussion before implementation.*
