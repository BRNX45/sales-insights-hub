import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { ROLE_RANK, type Role } from "@/lib/role";
import { useState, type ReactNode } from "react";

const NAV: { to: string; label: string; required: Role }[] = [
  { to: "/dashboard", label: "Dashboard", required: "user" },
  { to: "/sales/new", label: "New Sale", required: "user" },
  { to: "/customers", label: "Search", required: "user" },
  { to: "/admin", label: "Admin", required: "admin" },
  { to: "/admin/users", label: "Users", required: "admin" },
  { to: "/admin/products", label: "Products", required: "admin" },
  { to: "/admin/inventory", label: "Inventory", required: "admin" },
  { to: "/admin/approvals", label: "Approvals", required: "admin" },
  { to: "/admin/export", label: "Export", required: "admin" },
  { to: "/super-admin", label: "Super Admin", required: "super_admin" },
  { to: "/super-admin/admins", label: "Manage Admins", required: "super_admin" },
  { to: "/super-admin/settings", label: "Settings", required: "super_admin" },
  { to: "/super-admin/activity", label: "Activity", required: "super_admin" },
  { to: "/super-admin/backup", label: "Backup", required: "super_admin" },
  { to: "/super-admin/security", label: "Security", required: "super_admin" },
];

const ROLE_LABEL: Record<Role, string> = {
  user: "User",
  admin: "Admin",
  super_admin: "Super Admin",
};

export function DashboardShell({ children, title }: { children: ReactNode; title: string }) {
  const { user, role, logout, setRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const visible = NAV.filter((n) => ROLE_RANK[role] >= ROLE_RANK[n.required]);
  const initials = (user?.fullName ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 gap-3">
          <Link to="/" className="font-bold tracking-tight text-base">
            Sales<span className="text-muted-foreground">/</span>OS
          </Link>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((m) => !m)}
              className="flex items-center gap-2 rounded-md border border-border px-2 py-1 text-xs"
            >
              <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground grid place-items-center font-semibold">
                {initials}
              </span>
              <span className="hidden sm:flex flex-col items-start leading-tight">
                <span className="font-medium">{user?.fullName}</span>
                <span className="text-[10px] text-muted-foreground">{ROLE_LABEL[role]}</span>
              </span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-md border border-border bg-card shadow-lg p-2 text-xs flex flex-col gap-1 z-20">
                <div className="px-2 py-2">
                  <div className="font-medium">{user?.fullName}</div>
                  <div className="text-muted-foreground truncate">{user?.email}</div>
                  <div className="mt-1 inline-block rounded bg-primary/10 text-primary px-1.5 py-0.5">
                    {ROLE_LABEL[role]}
                  </div>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="px-2 py-1.5 rounded hover:bg-accent"
                >
                  Profile
                </Link>
                {user?.role === "super_admin" && (
                  <div className="px-2 py-1.5 border-t border-border mt-1">
                    <div className="text-[10px] uppercase text-muted-foreground mb-1">
                      Impersonate
                    </div>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as Role)}
                      className="w-full rounded-md border border-border bg-background px-2 py-1"
                    >
                      <option value="user">View as User</option>
                      <option value="admin">View as Admin</option>
                      <option value="super_admin">View as Super Admin</option>
                    </select>
                  </div>
                )}
                <button
                  onClick={() => {
                    logout();
                    navigate({ to: "/login" });
                  }}
                  className="text-left px-2 py-1.5 rounded hover:bg-accent text-destructive border-t border-border mt-1"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl justify-center gap-1 px-2 pb-2 overflow-x-auto">
          {visible.map((n) => {
            const active = location.pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`whitespace-nowrap text-xs px-3 py-1.5 rounded-md border transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="px-4 py-8 max-w-6xl mx-auto flex flex-col gap-5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
        {children}
      </main>
    </div>
  );
}