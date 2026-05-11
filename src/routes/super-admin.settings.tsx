import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardShell } from "@/components/DashboardShell";
import { useAuth } from "@/lib/auth";
import { getSettings, setSettings, logActivity } from "@/lib/store";

export const Route = createFileRoute("/super-admin/settings")({
  head: () => ({ meta: [{ title: "System Settings — SalesOS" }] }),
  component: () => (
    <AuthGuard required="super_admin">
      <SettingsPage />
    </AuthGuard>
  ),
});

function SettingsPage() {
  const { user } = useAuth();
  const [s, setS] = useState(getSettings());
  const save = () => {
    setSettings(s);
    if (user) logActivity(user, "Updated system settings");
  };
  return (
    <DashboardShell title="System Settings">
      <div className="max-w-md rounded-lg border border-border bg-card p-5 flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-muted-foreground">Company name</span>
          <input className="rounded-md border border-border bg-background px-3 py-2 text-sm" value={s.companyName} onChange={(e) => setS({ ...s, companyName: e.target.value })} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={s.allowSignups} onChange={(e) => setS({ ...s, allowSignups: e.target.checked })} />
          Allow new account signups
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={s.maintenance} onChange={(e) => setS({ ...s, maintenance: e.target.checked })} />
          Enable maintenance mode
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-muted-foreground">Password policy</span>
          <input className="rounded-md border border-border bg-background px-3 py-2 text-sm" value={s.passwordPolicy} onChange={(e) => setS({ ...s, passwordPolicy: e.target.value })} />
        </label>
        <button onClick={save} className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm">Save</button>
      </div>
    </DashboardShell>
  );
}