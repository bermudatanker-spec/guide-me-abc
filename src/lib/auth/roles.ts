// src/lib/auth/roles.ts
export type AppRole = "super_admin" | "admin" | "business_owner";

export function normalizeRoles(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String).map((s) => s.toLowerCase()).filter(Boolean);
  if (typeof raw === "string") return [raw.toLowerCase()];
  return [];
}

export function isSuperAdminUser(user: any): boolean {
  const meta = user?.app_metadata ?? {};
  const roles = normalizeRoles(meta.roles ?? meta.role ?? user?.role);
  return roles.includes("super_admin") || roles.includes("superadmin");
}