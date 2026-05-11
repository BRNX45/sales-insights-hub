import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  ensureSeeded,
  getSession,
  getUsers,
  logActivity,
  setSession,
  setUsers,
  uid,
  type StoredUser,
} from "./store";
import type { Role } from "./role";

type AuthCtx = {
  user: StoredUser | null;
  role: Role;
  ready: boolean;
  login: (fullName: string, email: string) => StoredUser;
  signup: (fullName: string, email: string) => StoredUser;
  googleSignIn: (fullName?: string, email?: string) => StoredUser;
  logout: () => void;
  setRole: (r: Role) => void; // dev impersonation (super admin only)
  updateProfile: (patch: Partial<Pick<StoredUser, "fullName" | "email">>) => void;
  refresh: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

function findOrCreate(fullName: string, email: string, provider: "email" | "google"): StoredUser {
  const users = getUsers();
  const norm = email.trim().toLowerCase();
  let u = users.find((x) => x.email.toLowerCase() === norm);
  if (u) {
    if (fullName && u.fullName !== fullName) {
      u = { ...u, fullName };
      const next = users.map((x) => (x.id === u!.id ? u! : x));
      setUsers(next);
    }
    return u;
  }
  // First registered (non-seed) user becomes super_admin
  const nonSeed = users.filter((x) => !x.id.startsWith("seed-"));
  const role: Role = nonSeed.length === 0 ? "super_admin" : "user";
  const created: StoredUser = {
    id: uid(),
    fullName: fullName.trim() || norm.split("@")[0],
    email: norm,
    role,
    provider,
    createdAt: new Date().toISOString(),
  };
  setUsers([...users, created]);
  return created;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [impersonated, setImpersonated] = useState<Role | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = () => {
    const s = getSession();
    if (!s) {
      setUser(null);
      return;
    }
    const u = getUsers().find((x) => x.id === s.userId) ?? null;
    setUser(u);
  };

  useEffect(() => {
    ensureSeeded();
    refresh();
    setReady(true);
  }, []);

  const login = (fullName: string, email: string) => {
    const u = findOrCreate(fullName, email, "email");
    setSession({ userId: u.id });
    setUser(u);
    logActivity(u, "Logged in (email)");
    return u;
  };
  const signup = (fullName: string, email: string) => {
    const u = findOrCreate(fullName, email, "email");
    setSession({ userId: u.id });
    setUser(u);
    logActivity(u, "Signed up");
    return u;
  };
  const googleSignIn = (fullName?: string, email?: string) => {
    const fn = fullName?.trim() || "Google User";
    const em = email?.trim() || `demo+${Math.random().toString(36).slice(2, 7)}@gmail.com`;
    const u = findOrCreate(fn, em, "google");
    setSession({ userId: u.id });
    setUser(u);
    logActivity(u, "Logged in (Google)");
    return u;
  };
  const logout = () => {
    if (user) logActivity(user, "Logged out");
    setSession(null);
    setUser(null);
    setImpersonated(null);
  };
  const updateProfile = (patch: Partial<Pick<StoredUser, "fullName" | "email">>) => {
    if (!user) return;
    const users = getUsers();
    const next = users.map((x) => (x.id === user.id ? { ...x, ...patch } : x));
    setUsers(next);
    const updated = next.find((x) => x.id === user.id)!;
    setUser(updated);
    logActivity(updated, "Updated profile");
  };

  const role: Role = impersonated ?? user?.role ?? "user";

  return (
    <Ctx.Provider
      value={{
        user,
        role,
        ready,
        login,
        signup,
        googleSignIn,
        logout,
        setRole: (r) => setImpersonated(r),
        updateProfile,
        refresh,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
}