import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardShell } from "@/components/DashboardShell";
import { useAuth } from "@/lib/auth";
import { logActivity } from "@/lib/store";

export const Route = createFileRoute("/super-admin/security")({
  head: () => ({ meta: [{ title: "Security — SalesOS" }] }),
  component: () => (
    <AuthGuard required="super_admin">
      <SecurityPage />
    </AuthGuard>
  ),
});

function SecurityPage() {
  const { user } = useAuth();
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(60);
  const [ipAllowlist, setIpAllowlist] = useState("");
  return (
    <DashboardShell title="Security Settings">
      <div className="max-w-md rounded-lg border border-border bg-card p-5 flex flex-col gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={twoFactor} onChange={(e) => setTwoFactor(e.target.checked)} />
          Require two-factor auth for admins
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-muted-foreground">Session timeout (minutes)</span>
          <input type="number" value={sessionTimeout} onChange={(e) => setSessionTimeout(Number(e.target.value))} className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-muted-foreground">IP allowlist (comma-separated)</span>
          <textarea value={ipAllowlist} onChange={(e) => setIpAllowlist(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2 text-sm" rows={3} />
        </label>
        <button
          onClick={() => user && logActivity(user, "Updated security settings")}
          className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm"
        >
          Save
        </button>
        <p className="text-xs text-muted-foreground">
          These controls are demonstrative. Real enforcement requires server-side auth.
        </p>
      </div>
    </DashboardShell>
  );
}