import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardShell } from "@/components/DashboardShell";
import { getActivity } from "@/lib/store";

export const Route = createFileRoute("/super-admin/activity")({
  head: () => ({ meta: [{ title: "Activity Log — SalesOS" }] }),
  component: () => (
    <AuthGuard required="super_admin">
      <ActivityPage />
    </AuthGuard>
  ),
});

function ActivityPage() {
  const items = getActivity();
  return (
    <DashboardShell title="Activity Log">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activity yet.</p>
      ) : (
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          {items.map((e) => (
            <div key={e.id} className="px-3 py-2 text-xs flex justify-between gap-3">
              <div>
                <div className="font-medium">{e.action}</div>
                <div className="text-muted-foreground">{e.actorEmail}</div>
              </div>
              <div className="text-muted-foreground font-mono whitespace-nowrap">
                {new Date(e.at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}