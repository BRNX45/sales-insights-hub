import { Navigate } from "@tanstack/react-router";
import { useRole, hasAccess, type Role } from "@/lib/role";
import { ReactNode } from "react";

export function RoleGuard({ required, children }: { required: Role; children: ReactNode }) {
  const { role } = useRole();
  if (!hasAccess(role, required)) return <Navigate to="/dashboard" />;
  return <>{children}</>;
}