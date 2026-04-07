# AOA Traders Admin Frontend — TODO

> **Updated after every work session. Never skip this step.**
> Last updated: 2026-04-07 (ADMIN_FRONTEND.md v2 — all backend endpoints now live)
> Active engineer: AI (GitHub Copilot / Claude Sonnet 4.6)
> Target domain: `admin.aoatraders.com`
> Backend: `https://api.aoatraders.com`

---

## 🔄 ACTIVE BRANCH

**`feat/project-foundation`**

> Setting up the project foundation: scaffold, config, architecture docs, and base structure.

---

## 🗂 BUILD ORDER (Overall Roadmap)

Build features in this strict order to ensure a working, always-deployable system:

| Phase | Branch                        | Description                                                        | Status         |
|-------|-------------------------------|--------------------------------------------------------------------|----------------|
| 0     | `feat/project-foundation`     | Next.js scaffold, config, architecture docs, base structure        | 🔄 In Progress |
| 1     | `feat/auth`                   | WorkOS AuthKit middleware, /auth/callback, aoa_admin_token cookie  | ⏳ Planned     |
| 2     | `feat/layout`                 | Root layout, Sidebar (all 8 nav items), TopBar                     | ⏳ Planned     |
| 3     | `feat/dashboard`              | Platform overview — metrics, sync health, recent orders            | ⏳ Planned     |
| 4     | `feat/stores`                 | Store list + store detail (3 tabs: Overview / Config / Actions)    | ⏳ Planned     |
| 5     | `feat/orders`                 | Order queue + order detail with status management + Stripe cancel  | ⏳ Planned     |
| 6     | `feat/billing`                | Billing overview, MRR cards, plan distribution chart, assign plan  | ⏳ Planned     |
| 7     | `feat/sync`                   | Sync monitor, per-type status table, manual trigger controls       | ⏳ Planned     |
| 8     | `feat/price-plans`            | AOA internal markup tier table + edit modal                        | ⏳ Planned     |
| 9     | `feat/mappings`               | Category/brand mapping editable table                              | ⏳ Planned     |
| 10    | `feat/analytics`              | Analytics page — all endpoints live, margin fields null (display N/A)  | ⏳ Planned     |

> ✅ **All backend prerequisites are now met.** No phases are blocked on backend delivery.

---

## ✅ TASKS FOR CURRENT BRANCH: `feat/project-foundation`

### Phase 0 — Project Foundation

- [x] Read and follow `claude.md`
- [x] Read and follow `admin.frontend.instructions.md`
- [x] Read and internalize `ADMIN_FRONTEND.md` (product spec from backend agent)
- [x] Create `ARCHITECTURE.md` (system design source of truth)
- [x] Update `ARCHITECTURE.md` to reflect Next.js 15 App Router + correct 10 pages
- [x] Create `TODO.md` (this file)
- [x] Update `TODO.md` to reflect correct 11-phase build order
- [x] Create `TODOCOMPLETED.md`
- [ ] Scaffold **Next.js 15** project (App Router, TypeScript): `npx create-next-app@latest`
- [ ] Install and configure Tailwind CSS
- [ ] Install and configure shadcn/ui
- [ ] Install dependencies:
  - `@workos-inc/authkit-nextjs`
  - `@tanstack/react-query` v5
  - `@tanstack/react-table` v8
  - `react-hook-form` + `@hookform/resolvers`
  - `zod`
  - `react-hot-toast`
  - `lucide-react`
  - `recharts`
  - `date-fns`
- [ ] Create `.env.example` with all required env vars (see `ARCHITECTURE.md` §Environment)
- [ ] Create `middleware.ts` — WorkOS AuthKit (excludes `/auth/callback`, `_next`, `static`, `favicon`)
- [ ] Create `lib/api.ts` — fetch wrapper with JWT bearer from `aoa_admin_token` cookie + 401→redirect
- [ ] Create `utils/format.ts` — `formatDomain()`, `formatMarkup()`, `formatCurrency()`, `formatRelativeTime()`
- [ ] Create `utils/sanitize.ts` — output sanitization helpers
- [ ] Create `utils/validation.ts` — base Zod schemas
- [ ] Create `types/api.types.ts` — generic API response shapes + AppError
- [ ] Create `app/layout.tsx` stub (no sidebar yet — Phase 2)
- [ ] Create `app/page.tsx` — `redirect('/dashboard')`
- [ ] Verify: project builds with no TypeScript errors (`npm run build`)
- [ ] Verify: middleware correctly protects all routes except `/auth/callback`
- [ ] Verify: no console errors on startup

---

## ⏳ PLANNED BRANCHES

### Phase 1 — `feat/auth`

> ✅ **Backend unblocked**: `POST /auth/admin/exchange` is live as of `2f8681d`. Full implementation contract in `ADMIN_FRONTEND.md` §14.

- [ ] `app/auth/callback/page.tsx` — WorkOS OAuth callback handler
  - Receives `code` param from WorkOS
  - Uses `getUser({ code })` from `@workos-inc/authkit-nextjs` to get WorkOS access token
  - POSTs WorkOS access token to `POST /auth/admin/exchange`
  - On success: stores AOA JWT in httpOnly cookie `aoa_admin_token` (`maxAge: 86400`, `secure`, `sameSite: lax`)
  - On 401: redirect to `/auth/error?reason=<detail>` (not admin)
  - On 403: redirect to `/auth/error?reason=<detail>` (not in AOA org)
  - On 503: show server configuration error
  - Redirects to `/dashboard`
- [ ] `app/auth/error/page.tsx` — display `reason` param from URL
- [ ] Handle auth expiry in `lib/api.ts` — 401 on any API call → clear cookie → redirect to `/auth/login`
- [ ] Sign-out handler — clear `aoa_admin_token` cookie → redirect to `/auth/login`
- [ ] `types/auth.types.ts` — `AdminUser`, `AuthExchangeResponse`
- [ ] Test: middleware redirects unauthenticated user to WorkOS login
- [ ] Test: callback page sets cookie and redirects to `/dashboard`
- [ ] Test: 401 expired token redirects to `/auth/login`

---

### Phase 2 — `feat/layout`

- [ ] `app/layout.tsx` — root layout wrapping all protected routes with Sidebar + TopBar
- [ ] `components/layout/Sidebar.tsx` — navigation with 8 items + user avatar + sign out
  - Items: Dashboard, Stores, Orders, Billing, Sync, Price Plans, Mappings, Analytics
  - Highlight active route
  - Collapse to icon-only on mobile
- [ ] `components/layout/TopBar.tsx` — header with user email/avatar
- [ ] `components/common/LoadingSpinner.tsx`
- [ ] `components/common/EmptyState.tsx`
- [ ] `components/common/StatusBadge.tsx` — all statuses per `ADMIN_FRONTEND.md` §6.2
- [ ] `components/common/ConfirmModal.tsx` — props: `title`, `description`, `confirmText`, `onConfirm`
- [ ] `components/common/SyncTriggerButton.tsx` — POST → spinner → "Queued ✓" for 3s

---

### Phase 3 — `feat/dashboard`

**Data sources:** `GET /admin/stores`, `GET /admin/sync/status`, `GET /admin/orders?per_page=5&sort=created_at:desc`

- [ ] `app/dashboard/page.tsx`
- [ ] `lib/queries/useStores.ts` — initial version (list only)
- [ ] `lib/queries/useSync.ts` — initial version (status only)
- [ ] `lib/queries/useOrders.ts` — initial version (recent 5)
- [ ] `types/store.types.ts`
- [ ] `types/sync.types.ts`
- [ ] `types/order.types.ts`
- [ ] `components/analytics/KpiCard.tsx` — 4 stat cards: Active Stores, Monthly Revenue, Orders This Month, Pending Fulfillment
- [ ] Sync health panel — per-type status with colour coding (green <2h, yellow 2–6h, red >6h)
- [ ] Global sync trigger buttons — `POST /admin/sync/essendant/run` + `POST /admin/sync/shopify/run`
- [ ] Recent orders table — Order #, Store, Total, Status, Created → links to `/orders/[id]`

---

### Phase 4 — `feat/stores`

**Data sources:** `GET /admin/stores`, `GET /admin/stores/{id}`, `PATCH /admin/stores/{id}`, `POST /admin/stores/{id}/*`, `GET /billing/plans`

- [ ] `app/stores/page.tsx` — store list with filters (Plan / Status / search)
- [ ] `app/stores/[id]/page.tsx` — store detail (3 tabs)
- [ ] `lib/queries/useStores.ts` — full version with mutations
- [ ] `lib/queries/useBilling.ts` — `GET /billing/plans`
- [ ] `types/store.types.ts` — full schema including `sync_config`, `StoreUpdateRequest`
- [ ] `components/stores/StoreTable.tsx` — TanStack Table with Plan / Status / Last Sync / Auto Push
- [ ] `components/stores/StoreDetailTabs.tsx` — tab container
- [ ] `components/stores/StoreConfigForm.tsx` — React Hook Form + Zod for PATCH (markups + sync_config)
- [ ] `components/stores/StoreSyncActions.tsx` — all 9 action buttons with `SyncTriggerButton`
- [ ] Danger zone — "Deactivate Store" with domain-typed confirmation modal
- [ ] Plan assignment — dropdown from `/billing/plans` + confirm → re-fetch store on success
- [ ] `formatDomain()` used everywhere `.myshopify.com` appears
- [ ] `formatMarkup()` — decimal → % display, /100 on submit

---

### Phase 5 — `feat/orders`

**Data sources:** `GET /admin/orders`, `GET /admin/orders/{id}`, `PATCH /admin/orders/{id}/status`

- [ ] `app/orders/page.tsx` — order queue with status filter tabs + store dropdown + search
- [ ] `app/orders/[id]/page.tsx` — full order detail
- [ ] `lib/queries/useOrders.ts` — full version with status mutation
- [ ] `types/order.types.ts` — full schema with line items, status enum
- [ ] `components/orders/OrderTable.tsx` — TanStack Table with bulk checkbox actions
- [ ] `components/orders/OrderDetail.tsx` — header + summary card + line items table + totals
- [ ] `components/orders/OrderStatusPanel.tsx` — status transitions sidebar
  - `purchased` → "Mark as Fulfillment Sent" + "Cancel Order" (ConfirmModal + Stripe refund warning)
  - `fulfillment_sent` → "Mark as Shipped" (tracking number input required)
  - `shipped` → "Mark as Delivered"
- [ ] Margin computed client-side: `merchant_cost - aoa_cost`
- [ ] CSV export for bulk-selected orders
- [ ] Status badge colours per spec

---

### Phase 6 — `feat/billing`

**Data sources:** `GET /billing/plans`, `GET /admin/stores`, `POST /admin/stores/{id}/assign-plan`

- [ ] `app/billing/page.tsx`
- [ ] `lib/queries/useBilling.ts` — full version
- [ ] `types/billing.types.ts`
- [ ] MRR summary cards — Total Active Stores, MRR, Free Tier Count, Paid Tier Count
- [ ] Plan distribution chart (Recharts — pie or bar: Free / Starter / Growth / Pro)
- [ ] Store billing table — quick "Change Plan" inline with confirmation
- [ ] Plans reference table — Plan / Price / SKU Limit / Trial Days / Stores on Plan

---

### Phase 7 — `feat/sync`

**Data sources:** `GET /admin/sync/status`, `POST /admin/sync/essendant/run`, `POST /admin/sync/shopify/run`

- [ ] `app/sync/page.tsx`
- [ ] `lib/queries/useSync.ts` — full version
- [ ] `types/sync.types.ts` — full schema
- [ ] Global sync controls — Essendant + Shopify trigger buttons
- [ ] Per-sync-type status table — type / last run / duration / status / trigger button
- [ ] Per-store sync health table — store / last sync / products / plan / last error
- [ ] Red row highlight if `last_sync_at > 6h ago`

---

### Phase 8 — `feat/price-plans`

**Data sources:** `GET /admin/price-plans`, `PATCH /admin/price-plans/{id}`

- [ ] `app/price-plans/page.tsx`
- [ ] `lib/queries/usePricePlans.ts`
- [ ] Price plan table — Name / AOA Markup Retail % / AOA Markup VDS % / AOA Markup Wholesale % / Stores
- [ ] Edit modal — React Hook Form + Zod, decimal → % display, /100 on submit
- [ ] `PATCH /admin/price-plans/{id}` mutation with cache invalidation

---

### Phase 9 — `feat/mappings`

**Data sources:** `GET /admin/mappings`, `PATCH /admin/mappings/{id}`

- [ ] `app/mappings/page.tsx`
- [ ] `lib/queries/useMappings.ts`
- [ ] Editable table — inline edit or row edit modal
- [ ] `PATCH /admin/mappings/{id}` per row with cache invalidation

---

### Phase 10 — `feat/analytics`

> ✅ **Backend unblocked**: All 4 analytics endpoints live as of `2f8681d`. Full contracts in `ADMIN_FRONTEND.md` §15.
> ⚠️ **Margin fields**: `total_aoa_cost`, `total_aoa_margin`, `avg_margin_pct`, `margin`, `margin_pct` all return `null`. Display `N/A`/`—`. Do NOT remove columns.

- [ ] `types/analytics.types.ts` — `AnalyticsSummary`, `StoreAnalytics`, `OrdersOverTime`, `TopProduct`
- [ ] `lib/queries/useAnalytics.ts` — `useAnalyticsSummary`, `useAnalyticsStores`, `useOrdersOverTime`, `useTopProducts` with `buildPeriodQS` helper
- [ ] `app/analytics/page.tsx` — full page layout
- [ ] Period selector (top right) — This Month / Last Month / Last 3M / Last 12M / Custom Range; drive all queries via `useState`
- [ ] Row 1: KPI cards
  - **Total Orders** (period)
  - **AOA Revenue** (`total_merchant_revenue` — label as "AOA Revenue", not "Merchant Revenue")
  - **AOA Margin** (`total_aoa_margin` — display `N/A` with subtext "coming soon")
  - **Shopify MRR** (`mrr_shopify_billing`)
- [ ] Row 2 Left: `components/analytics/OrdersOverTimeChart.tsx`
  - Recharts ComposedChart — Bar (orders, left Y) + Line (revenue, right Y)
  - Use `revenue` field (not `margin`) from orders-over-time response
  - Auto-select granularity: ≤31d=day, ≤90d=week, >90d=month
  - Fill gaps (missing dates) with `{ orders: 0, revenue: 0 }` before passing to Recharts
- [ ] Row 2 Right: Revenue breakdown chart (Recharts stacked bar or donut)
  - Use `GET /admin/analytics/summary` for last 6 months (month-by-month)
- [ ] Row 3: `components/analytics/StorePerformanceTable.tsx`
  - TanStack Table, sortable by any column
  - Columns: Store | Plan | Products | Orders | AOA Revenue | Margin % |
  - Margin % column: display `—` if `null`; when populated: red <15%, yellow 15–25%, green >25%
  - Column tooltip on Margin %: "Margin tracking requires supplier cost data — coming soon"
  - Click row → `/stores/[id]`
- [ ] Row 4: `components/analytics/TopProductsTable.tsx`
  - Columns: SKU | Title | Supplier | Orders | AOA Revenue | Avg Margin %
  - `aoa_sku = null` → display "(unresolved SKU)"
  - `avg_margin_pct` → display `—`
  - Limit 20, "Load more" button
- [ ] Row 5: Order status donut chart (Recharts) — from `orders_by_status` in summary

---

## ✅ BACKEND PREREQUISITES — ALL RESOLVED

| # | Endpoint | Status | Commit |
|---|----------|--------|--------|
| 1 | `POST /auth/admin/exchange` | ✅ Live | `2f8681d` |
| 2 | `GET /admin/analytics/summary` | ✅ Live | `2f8681d` |
| 3 | `GET /admin/analytics/stores` | ✅ Live | `2f8681d` |
| 4 | `GET /admin/analytics/orders-over-time` | ✅ Live | `2f8681d` |
| 5 | `GET /admin/analytics/top-products` | ✅ Live | `2f8681d` |

> 🟡 **Remaining limitation (not a blocker):** Supplier cost is not tracked at order time. Margin fields (`total_aoa_cost`, `total_aoa_margin`, `avg_margin_pct`, `margin`, `margin_pct`) return `null` from all analytics endpoints until a future backend migration adds `unit_supplier_cost` to `aoa_order_items`.

---

## 🧩 SHARED COMPONENTS (built incrementally across phases)

- [ ] `StatusBadge.tsx` (Phase 2) — all order + store subscription statuses
- [ ] `SyncTriggerButton.tsx` (Phase 2) — reusable 202-aware trigger button
- [ ] `ConfirmModal.tsx` (Phase 2) — destructive action guard
- [ ] `LoadingSpinner.tsx` (Phase 2)
- [ ] `EmptyState.tsx` (Phase 2)
- [ ] `DataTable.tsx` (Phase 3) — generic TanStack Table v8 wrapper
- [ ] `Pagination.tsx` (Phase 3)

---

## 📝 DECISIONS LOG

| Date       | Decision                                                                              | Reason                                             |
|------------|---------------------------------------------------------------------------------------|----------------------------------------------------|
| 2026-04-06 | **Next.js 15 App Router** (not Vite + React Router)                                  | Specified in `ADMIN_FRONTEND.md` §2 — not optional |
| 2026-04-06 | **WorkOS AuthKit** (`@workos-inc/authkit-nextjs`) via Next.js middleware              | Specified in `ADMIN_FRONTEND.md` §3               |
| 2026-04-06 | **Native `fetch`** in `lib/api.ts` (not Axios)                                       | Specified in `ADMIN_FRONTEND.md` §3.4              |
| 2026-04-06 | **TanStack Table v8** for all data tables                                             | Specified in `ADMIN_FRONTEND.md` §2                |
| 2026-04-06 | **Recharts** for analytics charts                                                     | Specified in `ADMIN_FRONTEND.md` §2                |
| 2026-04-06 | **Vercel** as hosting target                                                          | Specified in `ADMIN_FRONTEND.md` §2 + §13          |
| 2026-04-06 | httpOnly cookie `aoa_admin_token` for AOA JWT (set by backend after WorkOS exchange)  | `ADMIN_FRONTEND.md` §3 — security requirement      |
| 2026-04-06 | All destructive actions require `ConfirmModal` before API call                        | `ADMIN_FRONTEND.md` §11.1 — multi-tenant safety    |
| 2026-04-06 | 202 sync responses: show "Queued ✓", no polling                                      | `ADMIN_FRONTEND.md` §11.2 — no completion callback |
| 2026-04-06 | Markup stored as decimal (0.25), displayed as % (×100), submitted ÷100               | `ADMIN_FRONTEND.md` §11.6                          |
| 2026-04-06 | Strip `.myshopify.com` from all shop domain displays via `formatDomain()`             | `ADMIN_FRONTEND.md` §11.4                          |
| 2026-04-06 | React Hook Form + Zod for all forms                                                   | Type-safe validation, good DX                      |
| 2026-04-06 | Components hard limit < 50 lines, single responsibility                               | `claude.md` + `admin.frontend.instructions.md`     |
| 2026-04-07 | Analytics page ships as **full implementation** (not placeholder)                    | All 4 analytics endpoints now live — `2f8681d`     |
| 2026-04-07 | Margin columns displayed as `N/A`/`—` (not removed) with "coming soon" tooltip       | `ADMIN_FRONTEND.md` §16 — keep layout ready        |
| 2026-04-07 | `total_merchant_revenue` displayed as **"AOA Revenue"** (not "Merchant Revenue")      | `ADMIN_FRONTEND.md` §15 — avoids confusion          |
| 2026-04-07 | `orders-over-time` time-series field is `revenue` (not `margin`)                     | `ADMIN_FRONTEND.md` §15 — actual response contract  |
| 2026-04-07 | Fill date gaps in orders-over-time series with `{ orders: 0, revenue: 0 }`           | `ADMIN_FRONTEND.md` §15 — Recharts needs continuous  |
| 2026-04-07 | `aoa_sku = null` rows in top-products displayed as "(unresolved SKU)"                | `ADMIN_FRONTEND.md` §15                            |
| 2026-04-07 | Auth 401/403 redirects to `/auth/error?reason=<detail>`, not a toast                 | `ADMIN_FRONTEND.md` §14 — clear UX for access errors |

---

## ✅ RESOLVED QUESTIONS

| Question | Resolution |
|----------|------------|
| What framework? | Next.js 15 App Router — confirmed in `ADMIN_FRONTEND.md` §2 |
| Is WorkOS confirmed? | Yes — WorkOS AuthKit via `@workos-inc/authkit-nextjs` |
| What API client? | Native fetch via `lib/api.ts` wrapper |
| Does `ADMIN_FRONTEND.md` exist? | Yes — received 2026-04-06 (v1), updated 2026-04-07 (v2) |
| What pages exist? | 10 protected pages — see `ARCHITECTURE.md` §Page Hierarchy |
| Are there role/permissions beyond auth? | Yes — WorkOS org check (`WORKOS_ADMIN_ORG_ID`) restricts to AOA staff only |
| Is `POST /auth/admin/exchange` built? | ✅ Yes — live as of `2f8681d` |
| Are analytics endpoints built? | ✅ Yes — all 4 live as of `2f8681d`. Margin fields return `null` (expected) |
| What is the orders-over-time revenue field called? | `revenue` (not `margin`) — see `ADMIN_FRONTEND.md` §15 |

---

*This file must be updated at the end of every work session.*
*Never mark something complete here without moving it to `TODOCOMPLETED.md`.*