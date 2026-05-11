import type { ReactNode } from "react";
import { AuthGuard } from "./AuthGuard";
import type { Role } from "@/lib/role";

export function RoleGuard({ required, children }: { required: Role; children: ReactNode }) {
  return <AuthGuard required={required}>{children}</AuthGuard>;
}