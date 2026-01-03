export function normalizeRoles(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input.map(r => String(r).toLowerCase());
  }
  if (typeof input === "string") {
    return [input.toLowerCase()];
  }
  return [];
}

export function getRoleFlags(user: any) {
  const roles = normalizeRoles(
    user?.app_metadata?.roles ??
    user?.app_metadata?.role ??
    user?.user_metadata?.roles ??
    user?.user_metadata?.role
  );

  const isSuperAdmin =
    roles.includes("super_admin") || roles.includes("superadmin");

  const isAdmin =
    isSuperAdmin ||
    roles.includes("admin") ||
    roles.includes("moderator");

  return { roles, isAdmin, isSuperAdmin };
}