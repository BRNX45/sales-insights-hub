import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardShell } from "@/components/DashboardShell";
import { getUsers } from "@/lib/store";

export const Route = createFileRoute("/super-admin/admins")({
  head: () => ({ meta: [{ title: "Manage Admins — SalesOS" }] }),
  component: () => (
    <AuthGuard required="super_admin">
      <AdminsPage />
    </AuthGuard>
  ),
});

function AdminsPage() {
  const admins = getUsers().filter((u) => u.role === "admin" || u.role === "super_admin");
  return (
    <DashboardShell title="Admins & Super Admins">
      <p className="text-sm text-muted-foreground">
        Promote, demote, or remove admins from the{" "}
        <Link to="/admin/users" className="underline text-primary">user management page</Link>.
      </p>
      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-muted-foreground"><tr className="text-left"><th className="px-3 py-2">Name</th><th className="px-3 py-2">Email</th><th className="px-3 py-2">Role</th></tr></thead>
          <tbody>
            {admins.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="px-3 py-2">{u.fullName}</td>
                <td className="px-3 py-2 text-muted-foreground">{u.email}</td>
                <td className="px-3 py-2 font-mono">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}