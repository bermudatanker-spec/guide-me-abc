import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type GuardOk = { ok: true };
type GuardFail = { ok: false; res: NextResponse };

function normalizeRole(role: unknown) {
  return String(role ?? "")
    .trim()
    .toLowerCase()
    .replaceAll("-", "_");
}

function isAllowed(role: string, roles: string[]) {
  // accepteer beide varianten + eventuele future-proof names
  const set = new Set([role, ...roles].map(normalizeRole));
  return (
    set.has("superadmin") ||
    set.has("super_admin") ||
    set.has("godmode") ||
    set.has("god_mode")
  );
}

export async function requireSuperAdmin(req: Request): Promise<GuardOk | GuardFail> {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (!token) {
    return {
      ok: false,
      res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const sb = supabaseAdmin();
  const { data, error } = await sb.auth.getUser(token);

  if (error || !data?.user) {
    return {
      ok: false,
      res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const role = normalizeRole((data.user as any).app_metadata?.role);
  const roles = Array.isArray((data.user as any).app_metadata?.roles)
    ? (data.user as any).app_metadata.roles
    : [];

  if (!isAllowed(role, roles)) {
    return {
      ok: false,
      res: NextResponse.json(
        { error: "Forbidden", role, roles },
        { status: 403 }
      ),
    };
  }

  return { ok: true };
}