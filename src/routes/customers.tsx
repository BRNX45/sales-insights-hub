import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardShell } from "@/components/DashboardShell";
import { getCustomers, getProducts } from "@/lib/store";

export const Route = createFileRoute("/customers")({
  head: () => ({ meta: [{ title: "Search — SalesOS" }] }),
  component: () => (
    <AuthGuard>
      <SearchPage />
    </AuthGuard>
  ),
});

function SearchPage() {
  const [q, setQ] = useState("");
  const customers = useMemo(() => getCustomers(), []);
  const products = useMemo(() => getProducts(), []);
  const term = q.trim().toLowerCase();
  const cs = term
    ? customers.filter(
        (c) =>
          c.id.toLowerCase().includes(term) ||
          c.name.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term),
      )
    : customers.slice(0, 20);
  const ps = term
    ? products.filter(
        (p) =>
          p.id.toLowerCase().includes(term) ||
          p.name.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term),
      )
    : products.slice(0, 20);

  return (
    <DashboardShell title="Search customers & products">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by name, ID, email, or category…"
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
      <div className="grid sm:grid-cols-2 gap-4">
        <Card title={`Customers (${cs.length})`}>
          {cs.map((c) => (
            <Row key={c.id} left={c.name} sub={c.email} right={c.id} />
          ))}
        </Card>
        <Card title={`Products (${ps.length})`}>
          {ps.map((p) => (
            <Row key={p.id} left={p.name} sub={p.category} right={`$${p.price}`} />
          ))}
        </Card>
      </div>
    </DashboardShell>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="px-3 py-2 border-b border-border text-sm font-semibold">{title}</div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}
function Row({ left, sub, right }: { left: string; sub: string; right: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 text-xs">
      <div>
        <div className="font-medium text-foreground">{left}</div>
        <div className="text-muted-foreground">{sub}</div>
      </div>
      <div className="font-mono">{right}</div>
    </div>
  );
}