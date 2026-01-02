import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

type GuardOk = { ok: true };
type GuardFail = { ok: false; res: NextResponse };

function normalizeRole(v?: unknown) {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function isAllowed(role?: unknown, roles?: unknown) {
  const set = new Set<string>();
  const r1 = normalizeRole(role);
  if (r1) set.add(r1);

  if (Array.isArray(roles)) {
    for (const r of roles) {
      const rr = normalizeRole(r);
      if (rr) set.add(rr);
    }
  }

  return set.has("superadmin") || set.has("super_admin") || set.has("godmode") || set.has("god_mode");
}

export async function requireSuperAdminServer(): Promise<GuardOk | GuardFail> {
  const cookieStore = await cookies(); // ✅ Next 15/16: await!

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        // in server components hoef je meestal niet te setten,
        // maar ssr client verwacht het type:
        set() {},
        remove() {},
      },
    }
  );

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    return {
      ok: false,
      res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const meta = data.user.app_metadata ?? {};
  const role = meta.role;
  const roles = meta.roles;

  if (!isAllowed(role, roles)) {
    return {
      ok: false,
      res: NextResponse.json({ error: "Forbidden", role, roles }, { status: 403 }),
    };
  }

  return { ok: true };
}