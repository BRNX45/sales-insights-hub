import { Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import type { ReactNode } from "react";
import { hasAccess, type Role } from "@/lib/role";

export function AuthGuard({
  children,
  required,
}: {
  children: ReactNode;
  required?: Role;
}) {
  const { user, role, ready } = useAuth();
  if (!ready) return null;
  if (!user) return <Navigate to="/login" />;
  if (required && !hasAccess(role, required)) return <Navigate to="/dashboard" />;
  return <>{children}</>;
}