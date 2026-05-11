import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardShell } from "@/components/DashboardShell";
import { useAuth } from "@/lib/auth";
import { getInventory, setInventory, getProducts, logActivity, type InventoryRow } from "@/lib/store";

export const Route = createFileRoute("/admin/inventory")({
  head: () => ({ meta: [{ title: "Inventory — SalesOS" }] }),
  component: () => (
    <AuthGuard required="admin">
      <InventoryPage />
    </AuthGuard>
  ),
});

function InventoryPage() {
  const { user } = useAuth();
  const products = getProducts();
  const [rows, setRows] = useState<InventoryRow[]>(getInventory());

  const update = (productId: string, stock: number) => {
    const next = rows.map((r) => (r.productId === productId ? { ...r, stock } : r));
    setRows(next);
    setInventory(next);
    if (user) logActivity(user, `Updated stock for ${productId} → ${stock}`);
  };

  return (
    <DashboardShell title="Inventory">
      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-muted-foreground"><tr className="text-left"><th className="px-3 py-2">Code</th><th className="px-3 py-2">Name</th><th className="px-3 py-2">Stock</th><th className="px-3 py-2">Status</th></tr></thead>
          <tbody>
            {rows.map((r) => {
              const p = products.find((x) => x.id === r.productId);
              const low = r.stock < 25;
              return (
                <tr key={r.productId} className="border-t border-border">
                  <td className="px-3 py-2 font-mono">{r.productId}</td>
                  <td className="px-3 py-2">{p?.name ?? "—"}</td>
                  <td className="px-3 py-2">
                    <input type="number" value={r.stock} onChange={(e) => update(r.productId, Number(e.target.value))} className="w-20 rounded border border-border bg-background px-2 py-0.5" />
                  </td>
                  <td className={`px-3 py-2 ${low ? "text-destructive" : "text-muted-foreground"}`}>{low ? "Low" : "OK"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}