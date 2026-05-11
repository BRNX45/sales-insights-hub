export type Role = "user" | "admin" | "super_admin";
export const ROLE_RANK: Record<Role, number> = { user: 1, admin: 2, super_admin: 3 };
export const hasAccess = (current: Role, required: Role) =>
  ROLE_RANK[current] >= ROLE_RANK[required];

// Backward-compat: re-export useRole from auth so older components keep working.
export { useAuth as useRole } from "./auth";