import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useRole, type Role, ROLE_RANK } from "@/lib/role";
import { ReactNode } from "react";

const NAV: { to: string; label: string; required: Role }[] = [
  { to: "/dashboard", label: "User Dashboard", required: "user" },
  { to: "/admin", label: "Admin Dashboard", required: "admin" },
  { to: "/super-admin", label: "Super Admin Panel", required: "super_admin" },
];

export function DashboardShell({ children, title }: { children: ReactNode; title: string }) {
  const { role, setRole } = useRole();
  const location = useLocation();
  const navigate = useNavigate();

  const visible = NAV.filter((n) => ROLE_RANK[role] >= ROLE_RANK[n.required]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3 gap-3">
          <Link to="/" className="font-bold tracking-tight text-base">
            Sales<span className="text-muted-foreground">/</span>OS
          </Link>
          <select
            value={role}
            onChange={(e) => {
              const next = e.target.value as Role;
              setRole(next);
              const cur = NAV.find((n) => n.to === location.pathname);
              if (cur && ROLE_RANK[next] < ROLE_RANK[cur.required]) {
                navigate({ to: "/dashboard" });
              }
            }}
            className="rounded-md border border-border bg-card text-card-foreground text-xs px-2 py-1.5"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
        <nav className="flex gap-1 px-2 pb-2 overflow-x-auto">
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
      <main className="px-4 py-5 max-w-7xl mx-auto flex flex-col gap-5">
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        {children}
      </main>
    </div>
  );
}