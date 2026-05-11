import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardShell } from "@/components/DashboardShell";
import { useAuth } from "@/lib/auth";
import { getProducts, setProducts, logActivity, type Product } from "@/lib/store";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "Products — SalesOS" }] }),
  component: () => (
    <AuthGuard required="admin">
      <ProductsPage />
    </AuthGuard>
  ),
});

function ProductsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Product[]>(getProducts());
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState({ id: "", name: "", price: "0", category: "" });

  const persist = (next: Product[], action: string) => {
    setProducts(next);
    setRows(next);
    if (user) logActivity(user, action);
  };

  const add = () => {
    if (!draft.id || !draft.name) return;
    persist(
      [
        ...rows,
        {
          id: draft.id,
          name: draft.name,
          price: Number(draft.price) || 0,
          category: draft.category,
        },
      ],
      `Added product ${draft.id}`,
    );
    setDraft({ id: "", name: "", price: "0", category: "" });
  };
  const remove = (id: string) =>
    persist(rows.filter((r) => r.id !== id), `Deleted product ${id}`);

  const filtered = rows.filter((r) =>
    [r.id, r.name, r.category].some((v) => v.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <DashboardShell title="Products">
      <div className="rounded-lg border border-border bg-card p-4 grid sm:grid-cols-5 gap-2">
        <input className="rounded-md border border-border bg-background px-2 py-1.5 text-sm" placeholder="Code" value={draft.id} onChange={(e) => setDraft({ ...draft, id: e.target.value })} />
        <input className="rounded-md border border-border bg-background px-2 py-1.5 text-sm sm:col-span-2" placeholder="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        <input className="rounded-md border border-border bg-background px-2 py-1.5 text-sm" placeholder="Category" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
        <div className="flex gap-1">
          <input className="w-20 rounded-md border border-border bg-background px-2 py-1.5 text-sm" placeholder="Price" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} />
          <button onClick={add} className="flex-1 rounded-md bg-primary text-primary-foreground text-sm">Add</button>
        </div>
      </div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-muted-foreground"><tr className="text-left"><th className="px-3 py-2">Code</th><th className="px-3 py-2">Name</th><th className="px-3 py-2">Category</th><th className="px-3 py-2">Price</th><th /></tr></thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-3 py-2 font-mono">{p.id}</td>
                <td className="px-3 py-2">{p.name}</td>
                <td className="px-3 py-2">{p.category}</td>
                <td className="px-3 py-2">${p.price}</td>
                <td className="px-3 py-2 text-right"><button className="text-destructive" onClick={() => remove(p.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}