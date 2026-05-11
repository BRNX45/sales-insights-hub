import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardShell } from "@/components/DashboardShell";
import { useAuth } from "@/lib/auth";
import { getSales, logActivity } from "@/lib/store";

export const Route = createFileRoute("/admin/export")({
  head: () => ({ meta: [{ title: "Export — SalesOS" }] }),
  component: () => (
    <AuthGuard required="admin">
      <ExportPage />
    </AuthGuard>
  ),
});

function ExportPage() {
  const { user } = useAuth();
  const download = () => {
    const rows = getSales();
    const header = "id,date,customer_id,product_id,owner_id,approved\n";
    const csv =
      header +
      rows
        .map((r) => [r.id, r.date, r.customerId, r.productId, r.ownerId, r.approved].join(","))
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    if (user) logActivity(user, "Exported sales report (CSV)");
  };
  return (
    <DashboardShell title="Export Reports">
      <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-3 max-w-md">
        <p className="text-sm text-muted-foreground">
          Download all sales data as a CSV file for analysis or backup.
        </p>
        <button onClick={download} className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm">
          Download sales.csv
        </button>
      </div>
    </DashboardShell>
  );
}