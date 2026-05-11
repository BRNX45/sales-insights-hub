import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardShell } from "@/components/DashboardShell";
import { useAuth } from "@/lib/auth";
import {
  getUsers,
  setUsers,
  uid,
  logActivity,
  type StoredUser,
} from "@/lib/store";
import type { Role } from "@/lib/role";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users — SalesOS" }] }),
  component: () => (
    <AuthGuard required="admin">
      <UsersPage />
    </AuthGuard>
  ),
});

function UsersPage() {
  const { user: me, role } = useAuth();
  const [users, setLocal] = useState<StoredUser[]>(getUsers());
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const canEditAdmins = role === "super_admin";

  const persist = (next: StoredUser[], action: string) => {
    setUsers(next);
    setLocal(next);
    if (me) logActivity(me, action);
  };

  const add = () => {
    if (!fullName.trim() || !email.trim()) return;
    const u: StoredUser = {
      id: uid(),
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      role: "user",
      provider: "email",
      createdAt: new Date().toISOString(),
    };
    persist([...users, u], `Created user ${u.email}`);
    setFullName("");
    setEmail("");
  };

  const updateRole = (id: string, r: Role) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    // Admins cannot promote to super_admin or edit other super_admins.
    if (!canEditAdmins && (target.role === "super_admin" || r === "super_admin")) return;
    persist(
      users.map((u) => (u.id === id ? { ...u, role: r } : u)),
      `Changed role of ${target.email} → ${r}`,
    );
  };

  const remove = (id: string) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    if (target.id === me?.id) return alert("You can't delete yourself.");
    if (!canEditAdmins && target.role !== "user") return;
    if (!confirm(`Delete ${target.email}?`)) return;
    persist(users.filter((u) => u.id !== id), `Deleted user ${target.email}`);
  };

  return (
    <DashboardShell title="Manage Users">
      <div className="rounded-lg border border-border bg-card p-4 flex flex-col sm:flex-row gap-2">
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full name"
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          onClick={add}
          className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm"
        >
          Add user
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-muted-foreground">
            <tr className="text-left">
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Role</th>
              <th className="px-3 py-2 font-medium">Provider</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const locked = !canEditAdmins && u.role !== "user";
              return (
                <tr key={u.id} className="border-t border-border">
                  <td className="px-3 py-2">{u.fullName}</td>
                  <td className="px-3 py-2 text-muted-foreground">{u.email}</td>
                  <td className="px-3 py-2">
                    <select
                      value={u.role}
                      disabled={locked || u.id === me?.id}
                      onChange={(e) => updateRole(u.id, e.target.value as Role)}
                      className="rounded border border-border bg-background px-1 py-0.5"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                      {canEditAdmins && <option value="super_admin">super_admin</option>}
                    </select>
                  </td>
                  <td className="px-3 py-2">{u.provider}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => remove(u.id)}
                      disabled={locked || u.id === me?.id}
                      className="text-destructive disabled:opacity-30"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!canEditAdmins && (
        <p className="text-xs text-muted-foreground">
          Admins can manage users only. Super Admins can create or delete other admins.
        </p>
      )}
    </DashboardShell>
  );
}