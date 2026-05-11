## Login + Role-Based Features

### Auth (no password, demo-style)

Since you want **name + email only** (no password) and a Google button, the cleanest fit is to keep things frontend-only for now and skip real Supabase auth. Real auth requires passwords or OAuth redirects, and Google sign-in requires enabling Lovable Cloud + setting up a Google OAuth client.

**Proposed approach — Demo Auth (frontend-only):**
- `/login` page: Full Name + Email fields → "Sign in"
- `/signup` page: Full Name + Email → "Create account"
- Google button: simulated (assigns a demo Google identity); a real Google login can be wired in a follow-up after enabling Lovable Cloud.
- Accounts stored in `localStorage` (list of users with name, email, role).
- Current session stored in `localStorage` too.
- First user to register becomes `super_admin`. Subsequent users default to `user`. Super admin can promote others.
- Role is **assigned per account**, replacing the role-switcher dropdown. (Super admin gets a hidden "Impersonate role" dev tool.)

If you instead want **real** Google login + secure accounts, say the word and I'll enable Lovable Cloud and switch to email-magic-link + Google OAuth (still no password).

### New Routes

```
/login            Public — name + email + Google button
/signup           Public — name + email + Google button
/profile          Any logged-in user — edit own name/email
/sales/new        Any logged-in user — add a sale
/sales/$id/edit   Owner or admin+
/customers       User — search customers/products
/admin/users     Admin+ — list, add, edit, delete users
/admin/products  Admin+ — manage products
/admin/inventory Admin+ — manage inventory
/admin/approvals Admin+ — approve sales
/admin/export    Admin+ — export reports (CSV)
/super-admin/admins      Super admin — manage admins
/super-admin/settings    Super admin — system settings
/super-admin/activity    Super admin — activity log
/super-admin/backup      Super admin — backup/restore (mock)
/super-admin/security    Super admin — security settings (mock)
```

### Permissions Matrix (enforced via `RoleGuard` + per-action checks)

| Capability | User | Admin | Super |
|---|---|---|---|
| Own sales CRUD | ✅ | ✅ | ✅ |
| View all sales | ❌ | ✅ | ✅ |
| Approve sales | ❌ | ✅ | ✅ |
| Manage users (CRUD) | ❌ | ✅ | ✅ |
| Manage products/inventory | ❌ | ✅ | ✅ |
| Export reports | ❌ | ✅ | ✅ |
| Create/edit admins | ❌ | ❌ | ✅ |
| System settings, backup, activity log, security | ❌ | ❌ | ✅ |

### Data Model (localStorage, Phase 1)

- `users`: `{ id, fullName, email, role, createdAt }[]`
- `session`: `{ userId }`
- `sales`: existing 124 rows + new ones, each tagged with `ownerId` (legacy 124 owned by a seeded demo user)
- `products`, `customers`, `inventory`, `activity_log`, `settings`: localStorage-backed
- Switch to Lovable Cloud later — components use a single `useStore()` facade so nothing changes when we migrate.

### Components

- `AuthProvider` + `useAuth()` — current user, login(name,email), signup, logout, googleSignIn (demo)
- `AuthGuard` (logged-in required) and existing `RoleGuard`
- `LoginForm`, `SignupForm`, `GoogleButton`
- `UserTable`, `ProductTable`, `InventoryTable`, `ApprovalsList`, `ActivityLog`
- `SaleForm` (add/edit)
- `ProfilePage`
- Header: replace demo role dropdown with **user avatar menu** (name, email, role badge, Logout). Keep dev-only role impersonator visible to super admin.

### Out of Scope (now)

- Real Google OAuth (needs Lovable Cloud + Google credentials)
- Password reset, email verification
- Real database backup
- Hard security (anyone could edit localStorage); fine for demo, not production

### Next Step

After approval I'll:
1. Build AuthProvider + login/signup pages + Google demo button
2. Wire AuthGuard across the app, replace role dropdown with user menu
3. Build the new admin/super-admin pages and the User CRUD + Sale CRUD + Profile flows
4. Seed legacy 124 sales to a demo user so charts keep working
