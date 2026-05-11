import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardShell } from "@/components/DashboardShell";
import { useAuth } from "@/lib/auth";
import { STORE_KEYS, logActivity } from "@/lib/store";

export const Route = createFileRoute("/super-admin/backup")({
  head: () => ({ meta: [{ title: "Backup & Restore — SalesOS" }] }),
  component: () => (
    <AuthGuard required="super_admin">
      <BackupPage />
    </AuthGuard>
  ),
});

function BackupPage() {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const backup = () => {
    const data: Record<string, unknown> = {};
    Object.values(STORE_KEYS).forEach((k) => {
      const v = localStorage.getItem(k);
      if (v) data[k] = JSON.parse(v);
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `salesos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (user) logActivity(user, "Created backup");
  };

  const restore = async (file: File) => {
    const text = await file.text();
    const data = JSON.parse(text);
    Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v)));
    if (user) logActivity(user, "Restored backup");
    alert("Backup restored. Reloading…");
    location.reload();
  };

  return (
    <DashboardShell title="Backup & Restore">
      <div className="max-w-md rounded-lg border border-border bg-card p-5 flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Download a JSON snapshot of all data or restore from a previous backup.
        </p>
        <button onClick={backup} className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm">
          Download backup
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="rounded-md border border-border px-4 py-2 text-sm"
        >
          Restore from file
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) restore(f);
          }}
        />
      </div>
    </DashboardShell>
  );
}