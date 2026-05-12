## Migrate SalesOS to Lovable Cloud

Lovable Cloud is now enabled. I'll replace the localStorage store with a real Postgres database, real authentication (email + Google), and row-level security so data persists and syncs across devices.

### Database schema (Postgres migration)

- `app_role` enum: `user | admin | super_admin`
- `profiles` — `id (uuid, references auth.users)`, `full_name`, `email`, `created_at`. Auto-created via trigger on signup.
- `user_roles` — `(user_id, role)` pair, separate table (never on profiles). Includes a `has_role(uid, role)` SECURITY DEFINER function for RLS.
- `products` — `id text PK`, `name`, `price`, `category`.
- `customers` — `id text PK`, `name`, `email`.
- `inventory` — `product_id PK FK`, `stock`.
- `sales` — `id text PK`, `date`, `customer_id`, `product_id`, `owner_id (uuid)`, `approved boolean`, `created_at`.
- `activity_log` — `id, at, actor_id, actor_email, action`.
- `settings` — single-row table (`id=1`), company name, maintenance, allow_signups, password_policy.
- First registered user is promoted to `super_admin` (trigger checks if `user_roles` is empty).
- Seeds the 124 professor-provided transactions, derived products/customers/inventory, and default settings.

### RLS policies (summary)

- `profiles`: each user reads/updates own; admins read all.
- `user_roles`: users read own; only super_admin can insert/update/delete.
- `sales`: all authenticated users read; users insert/update/delete only their own; admins/super_admin do anything; only admin+ can flip `approved`.
- `products`, `customers`, `inventory`: all authenticated read; admin+ write.
- `activity_log`: admin+ read; anyone authenticated insert their own row.
- `settings`: all authenticated read; only super_admin update.

### Auth

- Real Supabase auth via `@/integrations/supabase/client`.
- Email + password signup/login (replacing the passwordless demo, since real DB auth requires it).
- **Google Sign-In** via `lovable.auth.signInWithOAuth("google", …)` (Lovable Cloud managed — no API keys needed).
- Auto-confirm email **off** by default (users verify email). I'll mention this so you can flip it if you want instant signups during the demo.
- `AuthProvider` rewritten to wrap `supabase.auth.onAuthStateChange` + `getSession` and to load profile + role from the DB.

### Code changes

- Replace `src/lib/store.ts` localStorage facade with `src/lib/db.ts` thin Supabase query helpers (`listSales`, `addSale`, `approveSale`, `listProducts`, `upsertProduct`, etc.).
- Rewrite `src/lib/auth.tsx` to use Supabase auth + profile/role loading.
- Update every route currently importing from `@/lib/store` to use the new async helpers via TanStack Query (`useQuery` / `useMutation`).
- Update `AuthForm` to add a password field + Google button using the Lovable OAuth helper.
- Keep all current routes/UI/role-gating intact — only the data source changes.
- Activity logging now writes to the DB and is visible to admin+.

### Out of scope

- Email magic-link (kept password-based for simplicity; can swap to magic link later).
- Realtime sync across tabs (can add `supabase.channel` later).
- Backup/restore now operates on DB tables (export JSON of all tables, restore via admin RPC) — kept functional but as a super-admin only feature.

### Tradeoffs / things to confirm

- Existing localStorage data won't migrate — accounts created in the old demo are gone after this switch (the seeded 124 sales are re-seeded server-side).
- Switching to password-based login is the cleanest path; passwordless email-link is doable as a follow-up if you want it.

After you approve, I'll run the migration, rewrite the auth + data layer, and update the routes.
