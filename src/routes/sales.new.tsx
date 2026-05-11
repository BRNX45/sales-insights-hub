import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardShell } from "@/components/DashboardShell";
import { useAuth } from "@/lib/auth";
import { getSales, setSales, logActivity } from "@/lib/store";

export const Route = createFileRoute("/sales/new")({
  head: () => ({ meta: [{ title: "New Sale — SalesOS" }] }),
  component: () => (
    <AuthGuard>
      <NewSalePage />
    </AuthGuard>
  ),
});

function NewSalePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [err, setErr] = useState("");

  const submit = () => {
    if (!customerId.trim() || !productId.trim())
      return setErr("Customer and product are required.");
    const rows = getSales();
    const id = `TR${String(rows.length + 1).padStart(6, "0")}`;
    const sale = {
      id,
      date,
      customerId: customerId.trim(),
      productId: productId.trim(),
      ownerId: user!.id,
      approved: false,
    };
    setSales([...rows, sale]);
    logActivity(user!, `Added sale ${id}`);
    navigate({ to: "/dashboard" });
  };

  return (
    <DashboardShell title="Add a sale">
      <div className="max-w-md rounded-lg border border-border bg-card p-5 flex flex-col gap-3">
        <Field label="Date">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Customer ID">
          <input
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            placeholder="C0001"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Product ID">
          <input
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="00005"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </Field>
        {err && <p className="text-xs text-destructive">{err}</p>}
        <p className="text-xs text-muted-foreground">
          New sales are saved as pending approval until an admin approves them.
        </p>
        <button
          onClick={submit}
          className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm"
        >
          Save sale
        </button>
      </div>
    </DashboardShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}