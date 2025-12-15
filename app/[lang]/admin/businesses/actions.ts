// app/[lang]/admin/businesses/actions.ts
"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import type { Locale } from "@/i18n/config";
import { langHref } from "@/lib/lang-href";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Result<T = {}> = { ok: true } & T | { ok: false; error: string };

type ListingStatus = "pending" | "active" | "inactive";
type Plan = "starter" | "growth" | "pro";

function getRoles(user: any): string[] {
  const meta = user?.app_metadata ?? {};
  const raw = meta.roles ?? meta.role ?? user?.role ?? [];
  const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return arr.map((r) => String(r).trim().toLowerCase()).filter(Boolean);
}

function isSuperAdmin(user: any) {
  const roles = getRoles(user);
  return roles.includes("super_admin") || roles.includes("superadmin");
}

async function ensureSuperAdminOrFail(): Promise<Result<{ userId: string }>> {
  const sb: any = await supabaseServer();
  const { data, error } = await sb.auth.getUser();
  if (error) return { ok: false, error: error.message };
  const user = data?.user;
  if (!user) return { ok: false, error: "Niet ingelogd." };
  if (!isSuperAdmin(user)) return { ok: false, error: "Geen super_admin rechten." };
  return { ok: true, userId: user.id };
}

async function auditBestEffort(input: {
  actorUserId: string;
  businessId: string;
  action: "set_status" | "set_plan" | "delete" | "restore";
  detail?: any;
}) {
  try {
    const admin: any = supabaseAdmin();
    await admin.from("audit_business_moderation").insert({
      business_id: input.businessId,
      actor_user_id: input.actorUserId,
      action: input.action,
      detail: input.detail ?? null,
    });
  } catch {
    // best effort
  }
}

/** -------------------------------------------------------
 *  LIST: business_listings + businesses + latest subscription
 * ------------------------------------------------------ */
export async function adminListBusinessesAction(
  lang: Locale
): Promise<
  Result<{
    rows: Array<{
      business_id: string;
      business_name: string | null;
      island: string | null;
      status: ListingStatus | null;
      plan: Plan | null;
      deleted_at: string | null;
      subscription_status?: string | null;
      paid_until?: string | null; // we gebruiken subscriptions.ends_at
    }>;
  }>
> {
  const gate = await ensureSuperAdminOrFail();
  if (!gate.ok) return gate;

  try {
    const admin: any = supabaseAdmin();

    // 1) basis rows (listing + business)
    const { data: listings, error: lErr } = await admin
      .from("business_listings")
      .select("business_id, status, subscription_plan, island, business_name, deleted_at")
      .order("created_at", { ascending: false });

    if (lErr) return { ok: false, error: lErr.message };

    const base = (listings ?? []).map((r: any) => ({
      business_id: r.business_id,
      business_name: r.business_name ?? null,
      island: r.island ?? null,
      status: (r.status ?? null) as ListingStatus | null,
      plan: (r.subscription_plan ?? null) as Plan | null,
      deleted_at: r.deleted_at ?? null,
    }));

    const businessIds = Array.from(
      new Set(base.map((r: any) => r.business_id).filter(Boolean))
    );

    if (businessIds.length === 0) return { ok: true, rows: [] };

    // 2) subscriptions: pak latest per business_id via order desc
    const { data: subs, error: sErr } = await admin
      .from("subscriptions")
      .select("business_id, plan, status, ends_at, created_at")
      .in("business_id", businessIds)
      .order("created_at", { ascending: false });

    // Als subscriptions niet werkt of table niet bestaat → gewoon base terug
    if (sErr) return { ok: true, rows: base };

    const latest = new Map<string, any>();
    for (const s of subs ?? []) {
      if (!latest.has(s.business_id)) latest.set(s.business_id, s);
    }

    const merged = base.map((r: any) => {
      const s = latest.get(r.business_id);
      return {
        ...r,
        // ✅ optie B: toon subscription info
        plan: (s?.plan ?? r.plan ?? null) as Plan | null,
        subscription_status: (s?.status ?? null) as string | null,
        paid_until: (s?.ends_at ?? null) as string | null,
      };
    });

    // 3) dedupe: 1 rij per business_id (React key fix)
    const dedup = new Map<string, any>();
    for (const r of merged) dedup.set(r.business_id, r);

    return { ok: true, rows: Array.from(dedup.values()) };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Onbekende fout." };
  }
}

/** -------------------------------------------------------
 *  SET STATUS
 * ------------------------------------------------------ */
export async function adminSetListingStatusAction(
  lang: Locale,
  businessId: string,
  status: ListingStatus
): Promise<Result> {
  const gate = await ensureSuperAdminOrFail();
  if (!gate.ok) return gate;
  if (!businessId) return { ok: false, error: "businessId ontbreekt." };

  try {
    const admin: any = supabaseAdmin();

    const { error } = await admin
      .from("business_listings")
      .update({ status })
      .eq("business_id", businessId);

    if (error) return { ok: false, error: error.message };

    await auditBestEffort({
      actorUserId: gate.userId,
      businessId,
      action: "set_status",
      detail: { status },
    });

    revalidatePath(langHref(lang, "/admin/businesses"));
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Onbekende fout." };
  }
}

/** -------------------------------------------------------
 *  SET PLAN (listing.subscription_plan)
 * ------------------------------------------------------ */
export async function adminSetListingPlanAction(
  lang: Locale,
  businessId: string,
  plan: Plan
): Promise<Result> {
  const gate = await ensureSuperAdminOrFail();
  if (!gate.ok) return gate;
  if (!businessId) return { ok: false, error: "businessId ontbreekt." };

  try {
    const admin: any = supabaseAdmin();

    const { error } = await admin
      .from("business_listings")
      .update({ subscription_plan: plan })
      .eq("business_id", businessId);

    if (error) return { ok: false, error: error.message };

    await auditBestEffort({
      actorUserId: gate.userId,
      businessId,
      action: "set_plan",
      detail: { plan },
    });

    revalidatePath(langHref(lang, "/admin/businesses"));
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Onbekende fout." };
  }
}

/** -------------------------------------------------------
 *  SOFT DELETE (deleted_at)
 * ------------------------------------------------------ */
export async function adminSoftDeleteBusinessAction(
  lang: Locale,
  businessId: string
): Promise<Result> {
  const gate = await ensureSuperAdminOrFail();
  if (!gate.ok) return gate;
  if (!businessId) return { ok: false, error: "businessId ontbreekt." };

  try {
    const admin: any = supabaseAdmin();
    const ts = new Date().toISOString();

    const { error: bErr } = await admin
      .from("businesses")
      .update({ deleted_at: ts })
      .eq("id", businessId);
    if (bErr) return { ok: false, error: bErr.message };

    const { error: lErr } = await admin
      .from("business_listings")
      .update({ deleted_at: ts })
      .eq("business_id", businessId);
    if (lErr) return { ok: false, error: lErr.message };

    await auditBestEffort({
      actorUserId: gate.userId,
      businessId,
      action: "delete",
      detail: { deleted_at: ts },
    });

    revalidatePath(langHref(lang, "/admin/businesses"));
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Onbekende fout." };
  }
}

/** -------------------------------------------------------
 *  RESTORE
 * ------------------------------------------------------ */
export async function adminRestoreBusinessAction(
  lang: Locale,
  businessId: string
): Promise<Result> {
  const gate = await ensureSuperAdminOrFail();
  if (!gate.ok) return gate;
  if (!businessId) return { ok: false, error: "businessId ontbreekt." };

  try {
    const admin: any = supabaseAdmin();

    const { error: bErr } = await admin
      .from("businesses")
      .update({ deleted_at: null })
      .eq("id", businessId);
    if (bErr) return { ok: false, error: bErr.message };

    const { error: lErr } = await admin
      .from("business_listings")
      .update({ deleted_at: null })
      .eq("business_id", businessId);
    if (lErr) return { ok: false, error: lErr.message };

    await auditBestEffort({
      actorUserId: gate.userId,
      businessId,
      action: "restore",
      detail: { deleted_at: null },
    });

    revalidatePath(langHref(lang, "/admin/businesses"));
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Onbekende fout." };
  }
}