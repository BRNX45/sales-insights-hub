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
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      <div className="w-full max-w-3xl rounded-[2rem] border border-border bg-card/95 p-10 shadow-[0_30px_80px_rgba(47,57,85,0.08)] backdrop-blur-sm">
        <div className="flex flex-col items-center text-center gap-5">
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Sales Management Platform
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            SalesOS
          </h1>
          <p className="text-base leading-7 text-muted-foreground max-w-2xl">
            A modern sales management hub for tracking revenue, customers, inventory, and team performance in one place.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-border bg-background/80 p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Transactions</div>
            <div className="mt-2 text-3xl font-semibold">{kpis.total}</div>
            <p className="mt-1 text-sm text-muted-foreground">Sales recorded across your organization.</p>
          </div>
          <div className="rounded-2xl border border-border bg-background/80 p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Customers</div>
            <div className="mt-2 text-3xl font-semibold">{kpis.customers}</div>
            <p className="mt-1 text-sm text-muted-foreground">Unique customers driving revenue.</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-medium transition hover:bg-accent"
          >
            Create an account
          </Link>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3 text-center text-sm text-muted-foreground">
          <div className="rounded-2xl border border-border bg-background/80 p-4">
            <div className="font-semibold">Role-driven access</div>
            <p className="mt-2">Admin and super admin controls with secure role privileges.</p>
          </div>
          <div className="rounded-2xl border border-border bg-background/80 p-4">
            <div className="font-semibold">Fast insights</div>
            <p className="mt-2">Built-in KPIs and charts keep your sales team aligned.</p>
          </div>
          <div className="rounded-2xl border border-border bg-background/80 p-4">
            <div className="font-semibold">Inventory support</div>
            <p className="mt-2">Track products, approvals, and exports from one dashboard.</p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          The first account you create becomes Super Admin and can grant other roles.
        </p>
      </div>
    </div>
  );
}
