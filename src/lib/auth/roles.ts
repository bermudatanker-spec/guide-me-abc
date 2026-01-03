// src/lib/auth/roles.ts
export type Role = "super_admin" | "admin" | "moderator" | "superadmin";

function norm(v: unknown) {
  return String(v ?? "").trim().toLowerCase();
}

/**
 * Leest roles uit meerdere plekken (app_metadata.roles, app_metadata.role, user_metadata, etc)
 * en normaliseert naar lowercase strings.
 */
export function getRolesFromUser(user: any): string[] {
  const meta = user?.app_metadata ?? {};
  const uMeta = user?.user_metadata ?? {};

  const raw =
    meta.roles ??
    meta.role ??
    user?.role ??
    uMeta.roles ??
    uMeta.role ??
    [];

  const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return arr.map(norm).filter(Boolean);
}

export function isSuperAdmin(roles: string[]) {
  return roles.includes("super_admin") || roles.includes("superadmin");
}

export function isAdmin(roles: string[]) {
  return (
    roles.includes("admin") ||
    roles.includes("moderator") ||
    roles.includes("super_admin") ||
    roles.includes("superadmin")
  );
}

export function getRoleFlags(user: any) {
  const roles = getRolesFromUser(user);
  return {
    roles,
    isSuperAdmin: isSuperAdmin(roles),
    isAdmin: isAdmin(roles),
  };
}