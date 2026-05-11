import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardShell } from "@/components/DashboardShell";
import { useAuth } from "@/lib/auth";
import { getSales, setSales, logActivity } from "@/lib/store";

export const Route = createFileRoute("/admin/approvals")({
  head: () => ({ meta: [{ title: "Approvals — SalesOS" }] }),
  component: () => (
    <AuthGuard required="admin">
      <ApprovalsPage />
    </AuthGuard>
  ),
});

function ApprovalsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState(getSales());
  const pending = rows.filter((r) => !r.approved);

  const approve = (id: string) => {
    const next = rows.map((r) => (r.id === id ? { ...r, approved: true } : r));
    setRows(next);
    setSales(next);
    if (user) logActivity(user, `Approved sale ${id}`);
  };
  const reject = (id: string) => {
    const next = rows.filter((r) => r.id !== id);
    setRows(next);
    setSales(next);
    if (user) logActivity(user, `Rejected sale ${id}`);
  };

  return (
    <DashboardShell title="Pending Approvals">
      {pending.length === 0 ? (
        <p className="text-sm text-muted-foreground">No sales waiting for approval.</p>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-muted-foreground"><tr className="text-left"><th className="px-3 py-2">ID</th><th className="px-3 py-2">Date</th><th className="px-3 py-2">Customer</th><th className="px-3 py-2">Product</th><th /></tr></thead>
            <tbody>
              {pending.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-3 py-2 font-mono">{r.id}</td>
                  <td className="px-3 py-2">{r.date}</td>
                  <td className="px-3 py-2 font-mono">{r.customerId}</td>
                  <td className="px-3 py-2 font-mono">{r.productId}</td>
                  <td className="px-3 py-2 text-right flex gap-2 justify-end">
                    <button onClick={() => approve(r.id)} className="rounded bg-primary text-primary-foreground px-2 py-1">Approve</button>
                    <button onClick={() => reject(r.id)} className="rounded border border-border px-2 py-1 text-destructive">Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  );
}