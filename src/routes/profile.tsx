import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardShell } from "@/components/DashboardShell";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — SalesOS" }] }),
  component: () => (
    <AuthGuard>
      <ProfilePage />
    </AuthGuard>
  ),
});

function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saved, setSaved] = useState(false);

  return (
    <DashboardShell title="My Profile">
      <div className="max-w-md rounded-lg border border-border bg-card p-5 flex flex-col gap-3">
        <div className="text-xs text-muted-foreground">
          Role: <span className="text-foreground font-medium">{user?.role}</span> ·{" "}
          Provider: {user?.provider}
        </div>
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-muted-foreground">Full name</span>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-muted-foreground">Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => {
              updateProfile({ fullName: fullName.trim(), email: email.trim() });
              setSaved(true);
              setTimeout(() => setSaved(false), 1500);
            }}
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm"
          >
            Save
          </button>
          <button
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
            className="rounded-md border border-border px-4 py-2 text-sm text-destructive"
          >
            Log out
          </button>
        </div>
        {saved && <p className="text-xs text-primary">Saved.</p>}
      </div>
    </DashboardShell>
  );
}