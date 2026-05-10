import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "user" | "admin" | "super_admin";
export const ROLE_RANK: Record<Role, number> = { user: 1, admin: 2, super_admin: 3 };

type Ctx = { role: Role; setRole: (r: Role) => void };
const RoleContext = createContext<Ctx | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("user");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("role") as Role | null;
    if (stored && ROLE_RANK[stored]) setRole(stored);
  }, []);
  const update = (r: Role) => {
    setRole(r);
    if (typeof window !== "undefined") window.localStorage.setItem("role", r);
  };
  return <RoleContext.Provider value={{ role, setRole: update }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}

export const hasAccess = (current: Role, required: Role) =>
  ROLE_RANK[current] >= ROLE_RANK[required];