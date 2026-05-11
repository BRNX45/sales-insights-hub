import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
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
  const { user, ready } = useAuth();
  const kpis = getKpis();
  if (!ready) return null;
  if (user) return <Navigate to="/dashboard" />;
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

        <div className="flex flex-wrap gap-2">
          <Link
            to="/login"
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium"
          >
            Create an account
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          The first account you create becomes Super Admin and can grant other roles.
        </p>
      </div>
    </div>
  );
}
