
# Sales Management System — Plan

A role-based sales management website with three dashboards. Each higher role sees the dashboards below it. Charts are seeded with the 124 sales transactions provided by your professor.

## Roles & Visibility

- **User** — sees only the User Dashboard.
- **Admin** — sees Admin Dashboard + User Dashboard.
- **Super Admin** — sees Super Admin Panel + Admin Dashboard + User Dashboard.

A header **role-switcher** dropdown toggles between the three roles (frontend-only, no real login). This is perfect for a class demo and can be swapped for real auth later.

## Routes (TanStack Start)

```
/                  Landing + role switcher
/dashboard         User Dashboard         (any role)
/admin             Admin Dashboard        (admin, super_admin)
/super-admin       Super Admin Panel      (super_admin)
```

A pathless layout `_app` provides the shared shell (sidebar + header + role switcher). A simple `RoleGuard` redirects to `/` if the role is insufficient.

## Data Strategy

**Phase 1 — Static mock (now):**
- File `src/data/sales.ts` containing all 124 transactions exactly as given (id, date, customer_id, product_id).
- Helper functions (`src/data/queries.ts`) compute aggregates: sales-per-month, top customers, top products, repeat-customer ratios, etc.
- Two known data quirks are kept as-is but flagged in a `data-notes.md` file: `TR000042` is dated `2020-10-25` (likely typo for 2010) and `TR000061`'s product code differs from your prof's pattern. The app uses the data verbatim; we won't silently "correct" it.

**Phase 2 — Real database (after professor shares customers + products tables):**
- Enable Lovable Cloud.
- Tables: `customers`, `products`, `sales` (matching the professor's schema).
- Seed `sales` from the provided INSERTs; seed the other two when you receive them.
- A small `useSalesSource()` hook switches charts from the static array to live queries — components don't change.

We'll start in Phase 1 immediately so the dashboards are visible and demo-ready today.

## Page Contents

Every dashboard includes the six required chart types as **placeholders** (titled cards with a stylized SVG preview, ready to be wired to a real chart library):
- **Line** — Sales volume over time
- **Bar** — Sales by product code
- **Pie** — Share by product code group
- **Funnel** — Customer journey (visited → purchased → repeat)
- **Heat Map** — Day-of-week × month activity
- **Scatter** — Customer transaction count vs. recency

### User Dashboard (`/dashboard`)
KPI cards: Total Transactions, Unique Customers, Unique Products, Latest Sale.
Chart grid: the six chart types above, scoped to "my view".

### Admin Dashboard (`/admin`)
Adds team-level KPIs (Repeat-Customer Rate, Best-selling Product, Avg Transactions/Customer).
Tabs: **Admin View** | **User View** (embedded user dashboard).

### Super Admin Panel (`/super-admin`)
Adds org-level KPIs (Quarterly Trend, Top Product Code, Customer Retention).
Tabs: **Super Admin View** | **Admin View** | **User View**.

A "Raw Data" table (paginated, searchable) is visible to Admin and Super Admin so you can show the professor the underlying 124 rows.

## Components

- `RoleProvider` + `useRole()` — current role in React context, persisted to localStorage.
- `RoleSwitcher` — header dropdown.
- `RoleGuard` — wraps protected routes.
- `DashboardShell` — sidebar (filtered by role) + topbar.
- `KpiCard` — metric card.
- `ChartPlaceholder` — `type` prop renders one of the six chart styles using inline SVG (no chart library yet → light bundle, clean placeholders).
- `ChartGrid` — responsive 2-col / 3-col layout, mobile-friendly (matches your 571px preview).
- `SalesTable` — raw transaction table with search + pagination.

## Design Direction

Editorial, data-dense but calm. Deep navy background with a single warm amber accent for highlights and KPI deltas. Sharp grotesk display + neutral sans body. All colors as `oklch` semantic tokens in `src/styles.css` (no hard-coded hex). Mobile-first since the current preview is narrow.

## Out of Scope (for now)

- Real authentication (we use a demo switcher).
- Real chart library (Recharts can be added in one follow-up once placeholders are approved).
- Customer & Product tables (waiting on professor).

## Next Step After Approval

1. Build the role system + shell.
2. Wire the 124 transactions into the data layer.
3. Render all three dashboards with KPI cards + the six chart placeholders.
4. Hand back so you can show the professor and decide whether to enable Lovable Cloud + add the missing tables.
