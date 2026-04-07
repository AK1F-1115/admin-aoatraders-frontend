# AOA Traders — Admin Frontend Implementation Guide

> **Target:** `admin.aoatraders.com`
> **Audience:** Frontend agent implementing the AOA Admin Dashboard
> **Backend API base:** `https://api.aoatraders.com`
> **Auth system:** WorkOS AuthKit

---

## 1. Overview

The AOA Admin Dashboard is an internal tool used exclusively by AOA staff to manage merchant stores, monitor sync pipelines, review orders, assign billing plans, and view platform-wide profitability analytics.

It is **not** the merchant-facing Shopify embedded app (that lives at `app.aoatraders.com`). This is the AOA back-office.

---

## 2. Technology Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Auth | WorkOS AuthKit (`@workos-inc/authkit-nextjs`) |
| UI Components | shadcn/ui + Tailwind CSS |
| Data Fetching | TanStack Query v5 (`@tanstack/react-query`) |
| Tables | TanStack Table v8 (`@tanstack/react-table`) |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Charts | Recharts |
| Hosting | Vercel (recommended) or static export on DO |

---

## 3. Authentication Flow

### 3.1 WorkOS AuthKit Setup

1. User visits `admin.aoatraders.com` → unauthenticated → redirect to WorkOS hosted login
2. WorkOS authenticates → redirects back to `/auth/callback`
3. Callback handler calls backend `POST /auth/admin/exchange` with the WorkOS access token
4. Backend verifies the WorkOS token, checks `role = admin`, issues a signed AOA JWT
5. Store AOA JWT in an **httpOnly cookie** (`aoa_admin_token`)
6. All API calls to `api.aoatraders.com` send `Authorization: Bearer <aoa_admin_token>`

### 3.2 Backend Exchange Endpoint — `POST /auth/admin/exchange`

> **✅ This endpoint is live as of `2f8681d`.** See Section 14 for the full implementation contract.

**Request:**
```http
POST /auth/admin/exchange
Content-Type: application/json

{ "workos_access_token": "..." }
```

**Response:**
```json
{
  "access_token": "<aoa_jwt>",
  "expires_in": 86400,
  "user": {
    "email": "admin@aoatraders.com",
    "name": "AOA Admin"
  }
}
```

**Error responses:**
- `401` — token decode failure, WorkOS user not found, or org membership check failed
- `403` — user is not in `WORKOS_ADMIN_ORG_ID` org, or not `role=admin` in AOA users table
- `503` — WorkOS env vars not configured on server (contact AOA ops)

### 3.3 Next.js Middleware

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

### 3.4 API Client

```typescript
// lib/api.ts
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getCookie('aoa_admin_token')
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

---

## 4. Route Map

| Route | Page | Description |
|---|---|---|
| `/` | Redirect → `/dashboard` | |
| `/dashboard` | Dashboard | Platform overview — key metrics + health status |
| `/stores` | Store List | All merchant stores with status + plan badges |
| `/stores/[id]` | Store Detail | Full store config editor + sync controls |
| `/orders` | Order Queue | Cross-store order management |
| `/orders/[id]` | Order Detail | Full order with line items + status controls |
| `/billing` | Billing Overview | Plan assignment + revenue overview |
| `/sync` | Sync Monitor | Sync status + manual trigger controls |
| `/price-plans` | Price Plans | AOA internal markup tier management |
| `/mappings` | Mappings | Category/brand mapping management |
| `/analytics` | Analytics & Profit | Platform-wide revenue, margin, and store analytics |
| `/auth/callback` | Auth Callback | WorkOS OAuth callback handler |

---

## 5. Page Specifications

---

### 5.1 `/dashboard` — Platform Overview

**Purpose:** First page after login. AOA staff should be able to answer "is everything working?" at a glance.

**Layout:** 4-column stat grid (top), then 2-column layout (sync health | recent activity).

**Data sources:**
- `GET /admin/stores` — store count, active count, plan breakdown
- `GET /admin/sync/status` — last sync timestamps, errors
- `GET /admin/orders?per_page=5&sort=created_at:desc` — recent orders
- `GET /billing/plans` — plan definitions (for legend)

**Stat cards (top row):**
1. **Active Stores** — count of `active=true` stores
2. **Monthly Revenue** — sum of `subscription_plans.price_usd` across active subscriptions (computed from plan assignments, not Stripe — this is Shopify billing)
3. **Orders This Month** — count of `aoa_orders` created this calendar month (needs backend endpoint or compute from order list)
4. **Pending Fulfillment** — count of orders with `status = purchased` (needs backend endpoint)

**Sync Health panel:**
- Last ICAPS sync time
- Status per sync type (retail, VDS, prices, inventory, status)
- Color-coded: green (<2h ago), yellow (2–6h), red (>6h or error)
- Manual trigger buttons → `POST /admin/sync/essendant/run` / `POST /admin/sync/shopify/run`

**Recent Orders table:**
- Columns: Order #, Store, Total, Status, Created
- Link to `/orders/[id]`
- Status badge colors: `pending_purchase`=gray, `purchased`=blue, `fulfillment_sent`=purple, `shipped`=green, `delivered`=green, `cancelled`=red

---

### 5.2 `/stores` — Store List

**Purpose:** Grid/table of all 15+ stores. Quick status overview + navigate to store detail.

**Data source:** `GET /admin/stores`

**Table columns:**
| Column | Source field | Notes |
|---|---|---|
| Store Name | `shop_domain` | Strip `.myshopify.com` for display |
| Plan | `subscription_plan.name` | Badge: Free=gray, Starter=blue, Growth=purple, Pro=gold |
| Status | `subscription_status` | Badge: active=green, pending=yellow, cancelled=red, free=gray |
| Products | `active_product_count` (from response) | |
| Last Sync | `last_sync_at` | Relative time (e.g. "2h ago") |
| Auto Push | `sync_config.push_retail` or `push_vds` | Enabled/disabled chip |
| Actions | — | "View" button → `/stores/[id]` |

**Filters (top bar):**
- Plan filter: All / Free / Starter / Growth / Pro
- Status filter: All / Active / Inactive
- Search: by shop domain

**Empty state:** "No stores connected yet."

---

### 5.3 `/stores/[id]` — Store Detail

**Purpose:** Full store management. Most-used page for AOA staff.

**Data source:** `GET /admin/stores/{id}`

**Layout:** 3-panel tabbed view

#### Tab 1: Overview
- Shop domain (read-only)
- Subscription plan + status badges
- Slots used / total (from `sync_config.max_retail` + active product count)
- `active` toggle (enable/disable store) → `PATCH /admin/stores/{id}` `{ active: bool }`
- `location_id` (read-only display)
- `collections_bootstrapped`, `shipping_profiles_bootstrapped` (read-only status chips)
- `installed_at`, `last_sync_at` (read-only)

#### Tab 2: Configuration
All fields use React Hook Form with Zod. Submit → `PATCH /admin/stores/{id}`.

**Markup section:**
- `merchant_markup_pct_retail` — number input (0–1000%), shown as %, stored as decimal
- `merchant_markup_pct_vds` — same
- `merchant_markup_pct_wholesale` — same

**Sync config editor:**
- `push_retail` — toggle
- `push_vds` — toggle
- `use_auto_pricing` — toggle
- `auto_shipping_profiles` — toggle
- `max_retail` — number input (SKU cap for retail)
- `max_vds` — number input (SKU cap for VDS)
- `retail_categories` — multi-select or comma-separated (category filter)
- `retail_brands` — multi-select (brand filter)
- `excluded_brands` — multi-select
- `excluded_categories` — multi-select
- `min_brand_products` — number input

**Plan assignment:**
- Dropdown: select from `GET /billing/plans`
- Submit → `POST /admin/stores/{id}/assign-plan` `{ "plan_id": int }`
- Show success toast with new plan name

#### Tab 3: Actions
Each action is a button that calls the corresponding endpoint. All return 202 (background task started). Show "Queued" toast on success.

| Button | Endpoint | Description |
|---|---|---|
| Sync Retail Products | `POST /admin/stores/{id}/sync/retail` | Push retail product catalog to Shopify |
| Sync VDS Products | `POST /admin/stores/{id}/sync/vds` | Push VDS/dropship catalog |
| Sync Prices | `POST /admin/stores/{id}/sync/prices` | Push updated prices to all variants |
| Sync Inventory | `POST /admin/stores/{id}/sync/inventory` | Push inventory levels |
| Sync Status | `POST /admin/stores/{id}/sync/status` | Reconcile active/inactive status |
| Bootstrap Collections | `POST /admin/stores/{id}/bootstrap-collections` | Create category + brand collections |
| Register Webhooks | `POST /admin/stores/{id}/register-webhooks` | Re-register all Shopify webhooks |
| Reset Shipping | `POST /admin/stores/{id}/reset-shipping` | Force re-bootstrap shipping profiles |
| Assign Plan | `POST /admin/stores/{id}/assign-plan` | See Tab 2 |

**Danger zone section** (red border):
- "Deactivate Store" — sets `active=false`
- Confirmation modal: "Type the store domain to confirm"

---

### 5.4 `/orders` — Order Queue

**Purpose:** AOA staff reviews and processes orders across all stores.

**Data source:** `GET /admin/orders?page=1&per_page=50&status=...&store_id=...&search=...`

**Table columns:**
| Column | Notes |
|---|---|
| Order # | `shopify_order_id`, link to `/orders/[id]` |
| Store | `store.shop_domain` (stripped) |
| Customer | `customer_name` |
| Items | count of line items |
| AOA Cost | `total_aoa_cost` |
| Total Charged | `total_merchant_cost` |
| Margin | `total_merchant_cost - total_aoa_cost` (computed client-side) |
| Status | Badge (see dashboard for colors) |
| Created | Relative time |

**Filters:**
- Status filter tabs: All / Pending Purchase / Purchased / Fulfillment Sent / Shipped / Delivered / Cancelled
- Store dropdown filter
- Search by order # or customer name

**Bulk actions** (checkbox select):
- Mark as Fulfillment Sent (for purchased orders)
- Export CSV

---

### 5.5 `/orders/[id]` — Order Detail

**Purpose:** Full order view. Status management. Refund trigger.

**Data source:** `GET /admin/orders/{id}`

**Layout:**

**Header:** Order # | Store | Status badge | Created date

**Order summary card:**
- Customer name + shipping address (from `shipping_address_json`)
- Shopify order ID (link to Shopify Admin)
- Stripe payment intent ID (if purchased)
- Payment status

**Line items table:**
| Column | Notes |
|---|---|
| AOA SKU | `aoa_sku` |
| Description | `title` |
| Supplier | `supplier` |
| Qty | `quantity` |
| AOA Cost | `unit_aoa_cost × quantity` |
| Merchant Price | `unit_merchant_cost × quantity` |
| Margin | computed |

**Totals row:** Total AOA Cost | Total Merchant Price | Total Margin

**Status management panel (right sidebar):**
- Current status displayed
- Available transitions based on current status:
  - `pending_purchase` → no admin action (merchant must purchase)
  - `purchased` → "Mark as Fulfillment Sent" + "Cancel Order" (triggers Stripe refund)
  - `fulfillment_sent` → "Mark as Shipped" (requires tracking number input)
  - `shipped` → "Mark as Delivered"
  - `delivered` → no further actions
  - `cancelled` → no further actions

**Cancel Order modal:** "This will issue a full Stripe refund to the merchant. Are you sure?"
→ `PATCH /admin/orders/{id}/status` `{ "status": "cancelled" }`

**Mark as Shipped:**
- Text input for tracking number (required)
→ `PATCH /admin/orders/{id}/status` `{ "status": "shipped", "tracking_number": "..." }`

---

### 5.6 `/billing` — Billing Overview

**Purpose:** Assign plans, see plan distribution, estimated MRR.

**Data sources:**
- `GET /billing/plans` — plan definitions (slug, name, price_usd, sku_limit)
- `GET /admin/stores` — store list with `subscription_plan` + `subscription_status`

**Sections:**

**MRR Summary (top):**
- Cards: Total Active Stores | MRR (sum of active store plan prices) | Free Tier Count | Paid Tier Count
- Note: MRR is computed from Shopify subscription plan pricing (not Stripe)

**Plan Distribution chart:**
- Pie or bar chart: Free / Starter / Growth / Pro store counts

**Store billing table:**
- Same columns as `/stores` but focused on billing state
- Quick "Change Plan" button → inline dropdown + confirm → `POST /admin/stores/{id}/assign-plan`

**Plans reference table:**
- Columns: Plan | Price/mo | SKU Limit | Trial Days | Stores on Plan
- Data from `GET /billing/plans`

---

### 5.7 `/sync` — Sync Monitor

**Purpose:** View sync pipeline health and manually trigger runs.

**Data source:** `GET /admin/sync/status`

**Layout:**

**Global sync controls:**
- "Run Full Essendant Sync" → `POST /admin/sync/essendant/run`
- "Run Full Shopify Push" → `POST /admin/sync/shopify/run`
- Both show spinner + "Queued" confirmation (202 response)

**Per-sync-type status table:**
| Sync Type | Last Run | Duration | Status | Action |
|---|---|---|---|---|
| Essendant Ingest | — | — | — | Trigger |
| Retail Product Push | — | — | — | — |
| VDS Product Push | — | — | — | — |
| Price Sync | — | — | — | — |
| Inventory Sync | — | — | — | — |
| Status Reconcile | — | — | — | — |

**Per-store sync health table:**
- For each store: store name | last sync | products active | plan | last error (if any)
- Red row highlight if last_sync_at > 6h ago

---

### 5.8 `/price-plans` — Price Plans

**Purpose:** View and edit AOA internal markup tiers.

**Data source:** `GET /admin/price-plans`

**Table columns:**
- Plan Name | AOA Markup Retail % | AOA Markup VDS % | AOA Markup Wholesale % | Stores on Plan | Actions

**Edit modal:**
- Form with three markup fields (decimal → displayed as %)
- Submit → `PATCH /admin/price-plans/{id}`

---

### 5.9 `/mappings` — Category/Brand Mappings

**Purpose:** Edit AOA's internal category and brand mappings used in sync filters.

**Data source:** `GET /admin/mappings`

**Display:** Editable table of category/brand → mapping value pairs.
**Edit in-line** or via row edit modal.
**Submit:** `PATCH /admin/mappings/{id}` per row.

---

### 5.10 `/analytics` — Analytics & Profit

**Purpose:** Platform-wide profitability reporting and store performance analytics.

This is the most data-intensive page. It answers: "How much money is AOA making?"

**⚠️ Note on data availability:** Most analytics data can be derived from existing tables (`aoa_orders`, `aoa_order_items`, `shopify_stores`, `subscription_plans`). No new tables are required for MVP. Complex queries should be implemented as dedicated backend endpoints rather than computed on the frontend.

---

#### 5.10.1 Analytics Backend Endpoints

> **✅ All four endpoints are live as of `2f8681d`.** See Section 15 for exact response contracts and query parameter details.

**⚠️ Margin fields return `null` in the current implementation** — `total_aoa_cost`, `total_aoa_margin`, and `avg_margin_pct` are always `null`. Display as "N/A" until a future backend migration adds supplier cost tracking. `total_merchant_revenue` is always populated.

Endpoint summaries:

**`GET /admin/analytics/summary`**
```json
{
  "period": "2026-04",
  "total_orders": 142,
  "total_aoa_cost": 18432.50,
  "total_merchant_revenue": 24816.00,
  "total_aoa_margin": 6383.50,
  "avg_margin_pct": 25.7,
  "orders_by_status": {
    "pending_purchase": 12,
    "purchased": 38,
    "fulfillment_sent": 19,
    "shipped": 55,
    "delivered": 14,
    "cancelled": 4
  },
  "active_stores": 14,
  "mrr_shopify_billing": 1049.72
}
```
Query params: `?period=2026-04` (YYYY-MM), `?start=2026-01-01&end=2026-04-30` (date range)

**`GET /admin/analytics/stores`**
Returns per-store breakdown:
```json
[
  {
    "store_id": 1,
    "shop_domain": "aacee-inc.myshopify.com",
    "plan": "pro",
    "orders_count": 87,
    "total_aoa_cost": 11200.00,
    "total_merchant_revenue": 15680.00,
    "margin": 4480.00,
    "margin_pct": 28.6,
    "active_products": 15472
  }
]
```
Query params: same period params as summary

**`GET /admin/analytics/orders-over-time`**
Returns daily/weekly order counts + margin for charting:
```json
{
  "granularity": "day",
  "series": [
    { "date": "2026-04-01", "orders": 5, "margin": 212.50 },
    { "date": "2026-04-02", "orders": 8, "margin": 348.00 }
  ]
}
```
Query params: `?start=2026-04-01&end=2026-04-30&granularity=day|week|month`

**`GET /admin/analytics/top-products`**
```json
[
  {
    "aoa_sku": "AOA-R-A1B2C3D4",
    "title": "...",
    "supplier": "essendant",
    "orders_count": 34,
    "total_margin": 892.40,
    "avg_margin_pct": 22.1
  }
]
```
Query params: `?limit=20&period=2026-04`

---

#### 5.10.2 Analytics Page Layout

**Period selector (top right):** This Month / Last Month / Last 3 Months / Last 12 Months / Custom Range

**Row 1 — KPI Cards:**
1. **Total Orders** (period) with trend arrow vs previous period
2. **Total AOA Margin** (period) — `sum(merchant_revenue - aoa_cost)`
3. **Avg Margin %** — `total_margin / total_merchant_revenue × 100`
4. **Shopify MRR** — monthly recurring from Shopify billing subscriptions (not order revenue)

**Row 2 — Charts (2 columns):**

**Left: Orders + Margin Over Time (line/bar combo)**
- X axis: dates (daily for <30d, weekly for 30–90d, monthly for >90d)
- Bar: order count (left Y axis)
- Line: daily margin $ (right Y axis)
- Data from `GET /admin/analytics/orders-over-time`

**Right: Revenue Breakdown (stacked bar or donut)**
- AOA Cost vs Margin vs (implied) merchant profit
- Per month for last 6 months
- Data from `GET /admin/analytics/summary` with monthly periods

**Row 3 — Store Performance Table**
- Source: `GET /admin/analytics/stores`
- Columns: Store | Plan | Products | Orders | AOA Revenue | AOA Margin | Margin % | 
- Sortable by any column
- Click row → `/stores/[id]`
- Color-code margin % (red <15%, yellow 15–25%, green >25%)

**Row 4 — Top Products by Margin**
- Source: `GET /admin/analytics/top-products`
- Table: SKU | Title | Supplier | Orders | Total Margin | Avg Margin %
- Limit 20 rows, "Load more" button

**Row 5 — Order Status Breakdown**
- Donut chart: order counts by status
- Source: `GET /admin/analytics/summary` → `orders_by_status`

---

## 6. Shared Components

### 6.1 Navigation Sidebar
```
AOA Admin
├── Dashboard
├── Stores
├── Orders
├── Billing
├── Sync
├── Price Plans
├── Mappings
└── Analytics
    ───
    [User avatar + email]
    [Sign Out]
```

Highlight active route. Collapse to icon-only on mobile.

### 6.2 StatusBadge Component
```typescript
// components/StatusBadge.tsx
const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  free: 'bg-gray-100 text-gray-700',
  purchased: 'bg-blue-100 text-blue-800',
  fulfillment_sent: 'bg-purple-100 text-purple-800',
  shipped: 'bg-green-100 text-green-800',
  delivered: 'bg-green-100 text-green-800',
}
```

### 6.3 SyncTriggerButton Component
```typescript
// Re-usable button that:
// 1. Fires the POST endpoint
// 2. Shows loading spinner while in-flight
// 3. Shows "Queued ✓" for 3 seconds on 202 response
// 4. Shows error toast on non-2xx
```

### 6.4 ConfirmModal Component
- "Are you sure?" modal with typed confirmation for destructive actions
- Props: `title`, `description`, `confirmText`, `onConfirm`

---

## 7. API Reference — Endpoints Used

All admin endpoints require `Authorization: Bearer <aoa_admin_token>`.

### Stores
| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/admin/stores` | — | List all stores |
| GET | `/admin/stores/{id}` | — | Single store detail |
| PATCH | `/admin/stores/{id}` | See Store schema | Update config/markups/active |
| POST | `/admin/stores/{id}/sync/retail` | — | Returns 202 |
| POST | `/admin/stores/{id}/sync/vds` | — | Returns 202 |
| POST | `/admin/stores/{id}/sync/prices` | — | Returns 202 |
| POST | `/admin/stores/{id}/sync/inventory` | — | Returns 202 |
| POST | `/admin/stores/{id}/sync/status` | — | Returns 202 |
| POST | `/admin/stores/{id}/bootstrap-collections` | — | Returns 202 |
| POST | `/admin/stores/{id}/register-webhooks` | — | Returns 202 |
| POST | `/admin/stores/{id}/assign-plan` | `{ "plan_id": int }` | Direct plan assignment |
| POST | `/admin/stores/{id}/reset-shipping` | — | Force re-bootstrap shipping |

### Orders
| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/admin/orders` | — | Query: `page`, `per_page`, `status`, `store_id`, `search` |
| GET | `/admin/orders/{id}` | — | Full order + line items |
| PATCH | `/admin/orders/{id}/status` | `{ status, tracking_number? }` | Updates status; `cancelled` triggers Stripe refund |

### Sync
| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/admin/sync/status` | — | All sync type statuses |
| POST | `/admin/sync/essendant/run` | — | Trigger full ICAPS ingest |
| POST | `/admin/sync/shopify/run` | — | Trigger full Shopify push |

### Billing
| Method | Path | Notes |
|---|---|---|
| GET | `/billing/plans` | Public — no auth needed |
| GET | `/admin/price-plans` | AOA internal price plan tiers |
| GET | `/admin/mappings` | Category/brand mappings |

### Analytics
| Method | Path | Notes |
|---|---|---|
| GET | `/admin/analytics/summary` | KPI summary for period — ✅ live |
| GET | `/admin/analytics/stores` | Per-store breakdown — ✅ live |
| GET | `/admin/analytics/orders-over-time` | Time series for charting — ✅ live |
| GET | `/admin/analytics/top-products` | Top products by revenue — ✅ live |

---

## 8. `PATCH /admin/stores/{id}` — Request Body Schema

```typescript
interface StoreUpdateRequest {
  // Markup percentages (0.0 = 0%, 1.0 = 100%)
  merchant_markup_pct_retail?: number;
  merchant_markup_pct_vds?: number;
  merchant_markup_pct_wholesale?: number;

  // Store active state
  active?: boolean;

  // Sync config (these are merged into the existing sync_config JSONB)
  sync_config?: {
    push_retail?: boolean;
    push_vds?: boolean;
    max_retail?: number | null;
    max_vds?: number | null;
    retail_categories?: string[];
    excluded_categories?: string[];
    retail_brands?: string[];
    excluded_brands?: string[];
    bootstrap_brands?: boolean;
    min_brand_products?: number;
    auto_shipping_profiles?: boolean;
    use_auto_pricing?: boolean;
  };
}
```

---

## 9. Environment Variables

```env
NEXT_PUBLIC_APP_URL=https://admin.aoatraders.com
NEXT_PUBLIC_API_URL=https://api.aoatraders.com
WORKOS_CLIENT_ID=client_...
WORKOS_API_KEY=sk_...
WORKOS_REDIRECT_URI=https://admin.aoatraders.com/auth/callback
WORKOS_ADMIN_ORG_ID=org_...   # AOA's own WorkOS org — used to restrict access
```

---

## 10. Project Structure

```
admin-frontend/
├── app/
│   ├── layout.tsx                  # Root layout with sidebar nav
│   ├── page.tsx                    # Redirect → /dashboard
│   ├── dashboard/
│   │   └── page.tsx
│   ├── stores/
│   │   ├── page.tsx                # Store list
│   │   └── [id]/
│   │       └── page.tsx            # Store detail (tabbed)
│   ├── orders/
│   │   ├── page.tsx                # Order queue
│   │   └── [id]/
│   │       └── page.tsx            # Order detail
│   ├── billing/
│   │   └── page.tsx
│   ├── sync/
│   │   └── page.tsx
│   ├── price-plans/
│   │   └── page.tsx
│   ├── mappings/
│   │   └── page.tsx
│   ├── analytics/
│   │   └── page.tsx
│   └── auth/
│       └── callback/
│           └── page.tsx            # WorkOS OAuth callback
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── TopBar.tsx
│   ├── ui/                         # shadcn/ui components
│   ├── StatusBadge.tsx
│   ├── SyncTriggerButton.tsx
│   ├── ConfirmModal.tsx
│   ├── stores/
│   │   ├── StoreTable.tsx
│   │   ├── StoreDetailTabs.tsx
│   │   ├── StoreConfigForm.tsx
│   │   └── StoreSyncActions.tsx
│   ├── orders/
│   │   ├── OrderTable.tsx
│   │   ├── OrderDetail.tsx
│   │   └── OrderStatusPanel.tsx
│   └── analytics/
│       ├── KpiCard.tsx
│       ├── OrdersOverTimeChart.tsx
│       ├── StorePerformanceTable.tsx
│       └── TopProductsTable.tsx
├── lib/
│   ├── api.ts                      # API client + auth token
│   ├── queries/                    # TanStack Query hooks
│   │   ├── useStores.ts
│   │   ├── useOrders.ts
│   │   ├── useAnalytics.ts
│   │   └── useSync.ts
│   └── utils.ts
├── middleware.ts                   # WorkOS auth middleware
├── next.config.ts
└── package.json
```

---

## 11. Key Implementation Notes

### 11.1 Multi-tenant Safety
The admin frontend has full read/write access to all stores. Every destructive action (deactivate store, cancel order, reset shipping, assign plan) **must have a confirmation modal** before firing the API call.

### 11.2 Sync Actions Return 202
All sync trigger endpoints return HTTP 202 immediately (the actual sync runs as a background task on the server). The frontend should:
- Show a loading spinner only until the 202 arrives
- Then show a "Queued ✓" success indicator
- Do NOT poll for completion — there is no completion callback yet
- Do NOT block the UI waiting for sync results

### 11.3 Plan Assignment Side Effects
`POST /admin/stores/{id}/assign-plan` immediately activates the plan and updates `sync_config` with the new SKU limits. After calling this, re-fetch the store with `GET /admin/stores/{id}` to refresh the displayed config.

### 11.4 Store Domain Display
Strip `.myshopify.com` from all shop domains for display. Example: `aacee-inc.myshopify.com` → `aacee-inc`.

### 11.5 Analytics — Margin Formula
```
margin = total_merchant_revenue - total_aoa_cost
margin_pct = (margin / total_merchant_revenue) × 100
```
where:
- `total_aoa_cost` = `sum(aoa_order_items.unit_aoa_cost × quantity)`
- `total_merchant_revenue` = `sum(aoa_order_items.unit_merchant_cost × quantity)`

These are pre-snapshotted at order capture time — never recalculated from current prices.

### 11.6 Markup Display Convention
Markup values in the DB are decimal ratios: `0.25` = 25%. Display with `×100` and `%` suffix. When the form submits, divide by 100 before sending to the API.

### 11.7 Authentication Expiry
The AOA JWT expires in 24 hours. If an API call returns 401, clear the cookie and redirect to WorkOS login. TanStack Query's `onError` callback is the right place to handle this globally.

---

## 12. Backend Prerequisites (Must Exist Before Frontend Goes Live)

| # | What | Status |
|---|---|---|
| 1 | `POST /auth/admin/exchange` | ✅ Built — `2f8681d` |
| 2 | All `/admin/*` endpoints | ✅ Exist |
| 3 | `GET /billing/plans` | ✅ Exists |
| 4 | `GET /admin/sync/status` | ✅ Exists |
| 5 | `GET /admin/analytics/summary` | ✅ Built — `2f8681d` |
| 6 | `GET /admin/analytics/stores` | ✅ Built — `2f8681d` |
| 7 | `GET /admin/analytics/orders-over-time` | ✅ Built — `2f8681d` |
| 8 | `GET /admin/analytics/top-products` | ✅ Built — `2f8681d` |

**Note on analytics margin fields:** `total_aoa_cost`, `total_aoa_margin`, and `avg_margin_pct`
return `null` in the current implementation. Supplier cost per unit is not stored at order
capture time. Display these as "N/A" in the frontend until a future backend migration adds
`unit_supplier_cost` to `aoa_order_items`.

**Required server `.env` additions before auth works:**
```env
WORKOS_API_KEY=sk_...
WORKOS_CLIENT_ID=client_...
WORKOS_ADMIN_ORG_ID=org_...
ALLOWED_ORIGINS=https://app.aoatraders.com,https://admin.aoatraders.com
```

---

## 13. Deployment Notes

- **Domain:** `admin.aoatraders.com` → point to Vercel deployment
- **CORS:** `https://admin.aoatraders.com` must be in the backend's `ALLOWED_ORIGINS` list in `.env` on the server
- **WorkOS redirect URI:** Must be registered in WorkOS dashboard: `https://admin.aoatraders.com/auth/callback`
- **Environment:** Separate from the merchant frontend at `app.aoatraders.com`

---

## 14. Auth Exchange — Implementation Contract

> **Endpoint:** `POST /auth/admin/exchange` — live as of `2f8681d`

### Full Auth Callback Flow (Next.js)

```typescript
// app/auth/callback/page.tsx
import { getAuthorizationUrl, getUser } from '@workos-inc/authkit-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AuthCallback({
  searchParams,
}: {
  searchParams: { code?: string }
}) {
  if (!searchParams.code) redirect('/auth/login')

  // 1. Exchange WorkOS auth code for WorkOS access token
  const { accessToken } = await getUser({ code: searchParams.code })

  // 2. Exchange WorkOS token for AOA JWT
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/admin/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workos_access_token: accessToken }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    // 401 = not admin, 403 = not in org, 503 = WorkOS not configured
    redirect(`/auth/error?reason=${encodeURIComponent(err.detail)}`)
  }

  const { access_token, expires_in, user } = await res.json()

  // 3. Store AOA JWT in httpOnly cookie
  const cookieStore = await cookies()
  cookieStore.set('aoa_admin_token', access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: expires_in, // 86400 = 24h
    path: '/',
  })

  redirect('/dashboard')
}
```

### Token Expiry Handling

The AOA JWT expires after **24 hours**. Handle 401 globally in your API client:

```typescript
// lib/api.ts
export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const cookieStore = await cookies() // server components
  const token = cookieStore.get('aoa_admin_token')?.value

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (res.status === 401) {
    // Token expired — clear cookie and redirect to login
    // In a client component, use router.push('/auth/login')
    redirect('/auth/login')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }

  return res.json()
}
```

### Sign-Out

```typescript
// Clear the httpOnly cookie and redirect to WorkOS logout
export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete('aoa_admin_token')
  redirect('https://api.workos.com/user_management/sessions/logout?...')
  // Or simply redirect to /auth/login
}
```

---

## 15. Analytics Endpoints — Full Contract

> All four endpoints are live as of `2f8681d`. All require `Authorization: Bearer <aoa_admin_token>`.

### Period Parameters (all endpoints)

All analytics endpoints accept one of:
- `?period=2026-04` — calendar month (YYYY-MM). Defaults to **current calendar month** if omitted.
- `?start=2026-04-01&end=2026-04-30` — explicit date range (both dates inclusive)

---

### `GET /admin/analytics/summary`

Platform-wide KPI for a period.

**Query params:** `period`, `start`, `end`

**Response:**
```typescript
interface AnalyticsSummary {
  period_start: string           // "2026-04-01"
  period_end: string             // "2026-04-30"
  total_orders: number           // ALL statuses including no_aoa_items
  total_merchant_revenue: number // sum of aoa_total_cost for non-cancelled, non-no_aoa_items orders
  total_aoa_cost: null           // ⚠️ always null — not tracked at order capture time
  total_aoa_margin: null         // ⚠️ always null
  avg_margin_pct: null           // ⚠️ always null
  orders_by_status: {
    pending_purchase: number
    purchased: number
    fulfillment_sent: number
    shipped: number
    delivered: number
    cancelled: number
    no_aoa_items: number
  }
  active_stores: number          // stores with active=true in DB
  mrr_shopify_billing: number    // sum of plan price_usd for stores with subscription_status='active'
}
```

**Important:** `total_merchant_revenue` = what merchants pay AOA for orders (not Shopify sales revenue). Display it as "AOA Revenue" not "Merchant Revenue" to avoid confusion.

**Usage:**
```typescript
// lib/queries/useAnalytics.ts
export function useAnalyticsSummary(period: string) {
  return useQuery({
    queryKey: ['analytics', 'summary', period],
    queryFn: () => apiRequest<AnalyticsSummary>(`/admin/analytics/summary?period=${period}`),
    staleTime: 5 * 60 * 1000, // 5 min
  })
}
```

---

### `GET /admin/analytics/stores`

Per-store breakdown, sorted by `total_merchant_revenue` descending.

**Query params:** `period`, `start`, `end`

**Response:** `StoreAnalytics[]`
```typescript
interface StoreAnalytics {
  store_id: number
  shop_domain: string            // e.g. "aacee-inc.myshopify.com" — strip .myshopify.com for display
  plan: string | null            // "free" | "starter" | "growth" | "pro" | null
  orders_count: number
  total_merchant_revenue: number // AOA revenue from this store (what they paid for orders)
  margin: null                   // ⚠️ always null
  margin_pct: null               // ⚠️ always null
  active_products: number        // count of active variant_tier=1 rows in shopify_variant_map
}
```

All stores are returned, even those with 0 orders in the period.

**Color-coding `total_merchant_revenue`:** No threshold guidance for now — sort descending and let the data speak.

---

### `GET /admin/analytics/orders-over-time`

Time series of order counts + revenue for the Recharts combo chart.

**Query params:**
- `start` — required (YYYY-MM-DD). Defaults to 30 days ago if omitted.
- `end` — required (YYYY-MM-DD, inclusive). Defaults to today if omitted.
- `granularity` — `day` | `week` | `month` (default: `day`)

**Response:**
```typescript
interface OrdersOverTime {
  granularity: 'day' | 'week' | 'month'
  series: Array<{
    date: string    // "2026-04-01" — always ISO date string
    orders: number  // count of ALL statuses
    revenue: number // sum of aoa_total_cost for non-cancelled, non-no_aoa_items
  }>
}
```

**Note:** The series only contains dates that have orders. Dates with no orders are absent — fill gaps with 0 on the frontend if your chart library requires a continuous series.

**Granularity selection logic (suggested):**
```typescript
function chooseGranularity(start: Date, end: Date): 'day' | 'week' | 'month' {
  const days = differenceInDays(end, start)
  if (days <= 31) return 'day'
  if (days <= 90) return 'week'
  return 'month'
}
```

**Usage:**
```typescript
export function useOrdersOverTime(start: string, end: string, granularity: string) {
  return useQuery({
    queryKey: ['analytics', 'orders-over-time', start, end, granularity],
    queryFn: () => apiRequest<OrdersOverTime>(
      `/admin/analytics/orders-over-time?start=${start}&end=${end}&granularity=${granularity}`
    ),
  })
}
```

---

### `GET /admin/analytics/top-products`

Top SKUs by merchant revenue, ordered by `total_merchant_revenue` descending.

**Query params:** `period`, `start`, `end`, `limit` (default 20, max 100)

**Response:** `TopProduct[]`
```typescript
interface TopProduct {
  aoa_sku: string | null          // null if SKU was not resolved at order time
  title: string | null            // product name from order item snapshot
  supplier: string | null         // "essendant" or "essendant_vds"
  orders_count: number            // distinct orders containing this SKU
  total_merchant_revenue: number  // sum of line_total_cost for this SKU
  avg_margin_pct: null            // ⚠️ always null
}
```

**Display `aoa_sku=null` rows** as "(unresolved SKU)" — these are items where the variant map lookup failed at order time.

---

### Suggested TanStack Query Hooks

```typescript
// lib/queries/useAnalytics.ts

interface PeriodParams {
  period?: string  // YYYY-MM
  start?: string   // YYYY-MM-DD
  end?: string     // YYYY-MM-DD
}

function buildPeriodQS(params: PeriodParams) {
  if (params.start && params.end)
    return `start=${params.start}&end=${params.end}`
  if (params.period)
    return `period=${params.period}`
  return `period=${format(new Date(), 'yyyy-MM')}`
}

export const useAnalyticsSummary = (params: PeriodParams) =>
  useQuery({
    queryKey: ['analytics', 'summary', params],
    queryFn: () => apiRequest<AnalyticsSummary>(`/admin/analytics/summary?${buildPeriodQS(params)}`),
    staleTime: 5 * 60 * 1000,
  })

export const useAnalyticsStores = (params: PeriodParams) =>
  useQuery({
    queryKey: ['analytics', 'stores', params],
    queryFn: () => apiRequest<StoreAnalytics[]>(`/admin/analytics/stores?${buildPeriodQS(params)}`),
    staleTime: 5 * 60 * 1000,
  })

export const useOrdersOverTime = (start: string, end: string, granularity: string) =>
  useQuery({
    queryKey: ['analytics', 'orders-over-time', start, end, granularity],
    queryFn: () => apiRequest<OrdersOverTime>(
      `/admin/analytics/orders-over-time?start=${start}&end=${end}&granularity=${granularity}`
    ),
    staleTime: 5 * 60 * 1000,
  })

export const useTopProducts = (params: PeriodParams, limit = 20) =>
  useQuery({
    queryKey: ['analytics', 'top-products', params, limit],
    queryFn: () => apiRequest<TopProduct[]>(
      `/admin/analytics/top-products?${buildPeriodQS(params)}&limit=${limit}`
    ),
    staleTime: 5 * 60 * 1000,
  })
```

---

## 16. Analytics Page — Margin Field Handling

**Current state:** The backend does not store AOA's supplier cost per order item. The fields `total_aoa_cost`, `total_aoa_margin`, `avg_margin_pct`, `margin`, and `margin_pct` all return `null` from every analytics endpoint.

**How to handle in the UI:**

```tsx
// components/analytics/KpiCard.tsx — margin card
<KpiCard
  label="AOA Margin"
  value={summary.total_aoa_margin != null
    ? formatCurrency(summary.total_aoa_margin)
    : 'N/A'}
  subtext={summary.total_aoa_margin == null
    ? 'Margin tracking coming soon'
    : undefined}
/>

// components/analytics/StorePerformanceTable.tsx — margin % column
<td className="text-gray-400 text-sm">
  {store.margin_pct != null ? `${store.margin_pct.toFixed(1)}%` : '—'}
</td>
```

Do **not** remove the margin columns from the UI — display them as `N/A` or `—` so the layout is ready when margin tracking is added in a future backend update. The column headers can include a tooltip: "Margin tracking requires supplier cost data — coming soon."

**What IS available now:**
- `total_merchant_revenue` — what merchants paid AOA in orders (reliable, always populated)
- `mrr_shopify_billing` — Shopify subscription MRR (reliable, always populated)
- Order counts by status (reliable)
- Per-store order counts and revenue (reliable)
- Per-product order counts and revenue (reliable)
