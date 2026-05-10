import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useRole } from "@/lib/role";
import { getKpis } from "@/data/queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SalesOS — Sales Management System" },
      { name: "description", content: "Role-based sales analytics dashboards." },
    ],
  }),
  component: Index,
});

function Index() {
  const { role, setRole } = useRole();
  const kpis = getKpis();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-5 py-12 flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Sales Management System
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            SalesOS
          </h1>
          <p className="text-muted-foreground max-w-prose">
            Role-based analytics over {kpis.total} transactions across {kpis.customers} customers
            and {kpis.products} products. Pick a role to enter the system.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { r: "user" as const, t: "User", d: "Personal sales view" },
            { r: "admin" as const, t: "Admin", d: "Team + user views" },
            { r: "super_admin" as const, t: "Super Admin", d: "Full org access" },
          ].map((opt) => (
            <button
              key={opt.r}
              onClick={() => setRole(opt.r)}
              className={`text-left rounded-lg border p-4 transition-colors ${
                role === opt.r
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="font-semibold">{opt.t}</div>
              <div className="text-xs text-muted-foreground mt-1">{opt.d}</div>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Link
            to="/dashboard"
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
          >
            Enter dashboard →
          </Link>
          {role !== "user" && (
            <Link
              to={role === "admin" ? "/admin" : "/super-admin"}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium"
            >
              Go to {role === "admin" ? "Admin" : "Super Admin"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
