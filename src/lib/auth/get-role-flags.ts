import type { User } from "@supabase/supabase-js";

type RoleFlags = {
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isOwner: boolean; // handig later, nu meestal false
  roles: string[];
};

function normalizeRoles(raw: unknown): string[] {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr
    .map((r) => String(r).trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Support:
 * - app_metadata.roles: string[]
 * - app_metadata.role: string
 * - user.role: string (fallback)
 */
export function getRoleFlags(user: User | null | undefined): RoleFlags {
  const meta: any = (user as any)?.app_metadata ?? {};
  const roles = normalizeRoles(meta.roles ?? meta.role ?? (user as any)?.role);

  const isSuperAdmin = roles.includes("super_admin") || roles.includes("superadmin");
  const isAdmin =
    isSuperAdmin || roles.includes("admin") || roles.includes("moderator");

  return {
    isSuperAdmin,
    isAdmin,
    isOwner: false,
    roles,
  };
}