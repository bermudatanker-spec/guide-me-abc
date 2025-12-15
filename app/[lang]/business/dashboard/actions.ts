"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import type { Locale } from "@/i18n/config";
import { langHref } from "@/lib/lang-href";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/* -------------------------------------------------------
   Types
------------------------------------------------------- */
type Ok<T = {}> = { ok: true } & T;
type Fail = { ok: false; error: string };
type Result<T = {}> = Ok<T> | Fail;

type ListingStatus = "pending" | "active" | "inactive";
type Plan = "starter" | "growth" | "pro";

type AuditAction =
  | "delete"
  | "undo_delete"
  | "set_status"
  | "set_plan"
  | "approve"
  | "reject";

type AdminBusinessRow = {
  business_id: string;
  listing_id: string | null;

  business_name: string | null;
  island: string | null;
  status: ListingStatus | null;
  subscription_plan: Plan | null;

  deleted_at: string | null;

  // Optie B: subscriptions (jij hebt: plan, status, started_at, ends_at, external_ref, ...)
  sub_plan: string | null;
  sub_status: string | null;
  paid_until: string | null; // mapped from subscriptions.ends_at
};

/* -------------------------------------------------------
   Role helpers
------------------------------------------------------- */
function getRoles(user: any): string[] {
  const meta = user?.app_metadata ?? {};
  const raw = meta.roles ?? meta.role ?? user?.role ?? [];
  const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return arr.map((r) => String(r).trim().toLowerCase()).filter(Boolean);
}

function isSuperAdmin(user: any): boolean {
  const roles = getRoles(user);
  return roles.includes("super_admin") || roles.includes("superadmin");
}

function nowIso() {
  return new Date().toISOString();
}

function cleanNote(note?: string | null) {
  const n = (note ?? "").trim();
  return n.length ? n : null;
}

/* -------------------------------------------------------
   Admin client safe wrapper (friendly error)
------------------------------------------------------- */
function getAdminClient(): Result<{ admin: any }> {
  try {
    const admin = supabaseAdmin();
    return { ok: true, admin };
  } catch (e: any) {
    return {
      ok: false,
      error:
        e?.message ??
        "Kon admin client niet initialiseren (check env SUPABASE_SERVICE_ROLE_KEY).",
    };
  }
}

/* -------------------------------------------------------
   Audit (best effort)
------------------------------------------------------- */
async function auditBestEffort(input: {
  actorUserId: string;
  businessId: string;
  action: AuditAction;
  note?: string | null;
  detail?: Record<string, unknown> | null;
}) {
  try {
    const gate = getAdminClient();
    if (!gate.ok) return;

    const { admin } = gate;
    await admin.from("audit_business_moderation").insert({
      business_id: input.businessId,
      actor_user_id: input.actorUserId,
      action: input.action,
      note: cleanNote(input.note),
      // als je deze kolom niet hebt: laat 'm weg (of zet hem op null)
      detail: input.detail ?? null,
    } as any);
  } catch {
    // best effort: nooit throwen
  }
}

/* -------------------------------------------------------
   Access checks
   - super_admin: existence check via admin client
   - owner: ownership check via server client (RLS)
------------------------------------------------------- */
async function ensureAccess(params: {
  businessId: string;
  user: any;
  requireNotDeleted: boolean;
}): Promise<Result> {
  const { businessId, user, requireNotDeleted } = params;

  if (!businessId) return { ok: false, error: "businessId ontbreekt." };

  // super_admin: check existence (optioneel deleted filter)
  if (isSuperAdmin(user)) {
    const gate = getAdminClient();
    if (!gate.ok) return gate;

    let q = gate.admin
      .from("businesses")
      .select("id, deleted_at")
      .eq("id", businessId);

    if (requireNotDeleted) q = q.is("deleted_at", null);

    const { data, error } = await q.maybeSingle();
    if (error) return { ok: false, error: error.message };
    if (!data?.id) {
      return {
        ok: false,
        error: requireNotDeleted
          ? "Business bestaat niet (of is al verwijderd)."
          : "Business bestaat niet.",
      };
    }
    return { ok: true };
  }

  // owner: via RLS ownership
  const supabase: any = await supabaseServer();
  let q = supabase
    .from("businesses")
    .select("id, deleted_at")
    .eq("id", businessId)
    .eq("user_id", user.id);

  if (requireNotDeleted) q = q.is("deleted_at", null);

  const { data, error } = await q.maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data?.id) {
    return {
      ok: false,
      error: requireNotDeleted
        ? "Geen toegang of business bestaat niet (of al verwijderd)."
        : "Geen toegang of business bestaat niet.",
    };
  }
  return { ok: true };
}

/* -------------------------------------------------------
   Auth helper
------------------------------------------------------- */
async function getAuthedUser(): Promise<
  Result<{ user: any; supabase: any }>
> {
  const supabase: any = await supabaseServer();
  const { data, error } = await supabase.auth.getUser();
  if (error) return { ok: false, error: error.message };
  const user = data?.user;
  if (!user) return { ok: false, error: "Niet ingelogd." };
  return { ok: true, user, supabase };
}

/* -------------------------------------------------------
   1) Admin list (Optie B: subscriptions join)
   Haalt listing + business + latest subscription (plan/status/ends_at)
------------------------------------------------------- */
export async function adminListBusinessesAction(
  lang: Locale
): Promise<Result<{ rows: AdminBusinessRow[] }>> {
  const auth = await getAuthedUser();
  if (!auth.ok) return auth;

  if (!isSuperAdmin(auth.user)) {
    return { ok: false, error: "Geen toegang (super_admin vereist)." };
  }

  const gate = getAdminClient();
  if (!gate.ok) return gate;

  // We pakken data uit business_listings en joinen de "latest" subscription via lateral join in SQL
  // Omdat PostgREST lateral join niet super fijn is, doen we het in 2 stappen:
  //  - listings + businesses
  //  - latest subscriptions per business in één query met order/limit (client-side map)
  // (Later kun je dit vervangen door een VIEW.)

  const { admin } = gate;

  const { data: listings, error: lErr } = await admin
    .from("business_listings")
    .select(
      "id, business_id, business_name, island, status, subscription_plan, deleted_at"
    )
    .order("created_at", { ascending: false });

  if (lErr) return { ok: false, error: lErr.message };

  const businessIds = Array.from(
    new Set((listings ?? []).map((x: any) => x.business_id).filter(Boolean))
  );

  let subsByBusiness = new Map<
    string,
    { plan: string | null; status: string | null; ends_at: string | null }
  >();

  if (businessIds.length) {
    const { data: subs, error: sErr } = await admin
      .from("subscriptions")
      .select("business_id, plan, status, ends_at, created_at")
      .in("business_id", businessIds)
      .order("created_at", { ascending: false });

    if (!sErr && subs?.length) {
      for (const s of subs) {
        // eerste (latest) wint
        if (!subsByBusiness.has(s.business_id)) {
          subsByBusiness.set(s.business_id, {
            plan: s.plan ?? null,
            status: s.status ?? null,
            ends_at: s.ends_at ?? null,
          });
        }
      }
    }
  }

  const rows: AdminBusinessRow[] = (listings ?? []).map((r: any) => {
    const sub = subsByBusiness.get(r.business_id);
    return {
      business_id: r.business_id,
      listing_id: r.id ?? null,
      business_name: r.business_name ?? null,
      island: r.island ?? null,
      status: r.status ?? null,
      subscription_plan: r.subscription_plan ?? null,
      deleted_at: r.deleted_at ?? null,
      sub_plan: sub?.plan ?? null,
      sub_status: sub?.status ?? null,
      paid_until: sub?.ends_at ?? null, // jouw schema gebruikt ends_at
    };
  });

  revalidatePath(langHref(lang, "/admin/businesses"));
  return { ok: true, rows };
}

/* -------------------------------------------------------
   2) Soft delete (owner + super_admin)
------------------------------------------------------- */
export async function softDeleteBusinessAction(
  lang: Locale,
  businessId: string,
  note?: string
): Promise<Result> {
  const auth = await getAuthedUser();
  if (!auth.ok) return auth;

  const access = await ensureAccess({
    businessId,
    user: auth.user,
    requireNotDeleted: true,
  });
  if (!access.ok) return access;

  const ts = nowIso();

  // super_admin => admin client
  if (isSuperAdmin(auth.user)) {
    const gate = getAdminClient();
    if (!gate.ok) return gate;

    const { admin } = gate;

    const { error: bErr } = await admin
      .from("businesses")
      .update({ deleted_at: ts } as any)
      .eq("id", businessId);

    if (bErr) return { ok: false, error: bErr.message };

    const { error: lErr } = await admin
      .from("business_listings")
      .update({ deleted_at: ts } as any)
      .eq("business_id", businessId);

    if (lErr) return { ok: false, error: lErr.message };

    await auditBestEffort({
      actorUserId: auth.user.id,
      businessId,
      action: "delete",
      note,
      detail: { via: "admin-actions" },
    });

    revalidatePath(langHref(lang, "/admin/businesses"));
    revalidatePath(langHref(lang, "/business/dashboard"));
    return { ok: true };
  }

  // owner => server client (RLS)
  const { supabase } = auth;

  const { error: bErr } = await supabase
    .from("businesses")
    .update({ deleted_at: ts } as any)
    .eq("id", businessId);

  if (bErr) return { ok: false, error: bErr.message };

  const { error: lErr } = await supabase
    .from("business_listings")
    .update({ deleted_at: ts } as any)
    .eq("business_id", businessId);

  if (lErr) return { ok: false, error: lErr.message };

  await auditBestEffort({
    actorUserId: auth.user.id,
    businessId,
    action: "delete",
    note,
    detail: { via: "owner-actions" },
  });

  revalidatePath(langHref(lang, "/business/dashboard"));
  return { ok: true };
}

/* -------------------------------------------------------
   3) Restore (owner + super_admin)
------------------------------------------------------- */
export async function undoDeleteBusinessAction(
  lang: Locale,
  businessId: string,
  note?: string
): Promise<Result> {
  const auth = await getAuthedUser();
  if (!auth.ok) return auth;

  const access = await ensureAccess({
    businessId,
    user: auth.user,
    requireNotDeleted: false,
  });
  if (!access.ok) return access;

  if (isSuperAdmin(auth.user)) {
    const gate = getAdminClient();
    if (!gate.ok) return gate;

    const { admin } = gate;

    const { error: bErr } = await admin
      .from("businesses")
      .update({ deleted_at: null } as any)
      .eq("id", businessId);

    if (bErr) return { ok: false, error: bErr.message };

    const { error: lErr } = await admin
      .from("business_listings")
      .update({ deleted_at: null } as any)
      .eq("business_id", businessId);

    if (lErr) return { ok: false, error: lErr.message };

    await auditBestEffort({
      actorUserId: auth.user.id,
      businessId,
      action: "undo_delete",
      note,
      detail: { via: "admin-actions" },
    });

    revalidatePath(langHref(lang, "/admin/businesses"));
    revalidatePath(langHref(lang, "/business/dashboard"));
    return { ok: true };
  }

  const { supabase } = auth;

  const { error: bErr } = await supabase
    .from("businesses")
    .update({ deleted_at: null } as any)
    .eq("id", businessId);

  if (bErr) return { ok: false, error: bErr.message };

  const { error: lErr } = await supabase
    .from("business_listings")
    .update({ deleted_at: null } as any)
    .eq("business_id", businessId);

  if (lErr) return { ok: false, error: lErr.message };

  await auditBestEffort({
    actorUserId: auth.user.id,
    businessId,
    action: "undo_delete",
    note,
    detail: { via: "owner-actions" },
  });

  revalidatePath(langHref(lang, "/business/dashboard"));
  return { ok: true };
}

/* -------------------------------------------------------
   4) Admin: set listing status (approve/reject/inactive/active)
   - super_admin only
------------------------------------------------------- */
export async function adminSetListingStatusAction(
  lang: Locale,
  businessId: string,
  status: ListingStatus,
  note?: string
): Promise<Result> {
  const auth = await getAuthedUser();
  if (!auth.ok) return auth;

  if (!isSuperAdmin(auth.user)) {
    return { ok: false, error: "Geen toegang (super_admin vereist)." };
  }

  const gate = getAdminClient();
  if (!gate.ok) return gate;

  const { admin } = gate;

  const { error } = await admin
    .from("business_listings")
    .update({ status } as any)
    .eq("business_id", businessId);

  if (error) return { ok: false, error: error.message };

  await auditBestEffort({
    actorUserId: auth.user.id,
    businessId,
    action: "set_status",
    note,
    detail: { status },
  });

  revalidatePath(langHref(lang, "/admin/businesses"));
  return { ok: true };
}

/* -------------------------------------------------------
   5) Admin: set listing plan (starter/growth/pro)
   - super_admin only
   - update subscription_plan on business_listings
------------------------------------------------------- */
export async function adminSetListingPlanAction(
  lang: Locale,
  businessId: string,
  plan: Plan,
  note?: string
): Promise<Result> {
  const auth = await getAuthedUser();
  if (!auth.ok) return auth;

  if (!isSuperAdmin(auth.user)) {
    return { ok: false, error: "Geen toegang (super_admin vereist)." };
  }

  const gate = getAdminClient();
  if (!gate.ok) return gate;

  const { admin } = gate;

  const { error } = await admin
    .from("business_listings")
    .update({ subscription_plan: plan } as any)
    .eq("business_id", businessId);

  if (error) return { ok: false, error: error.message };

  await auditBestEffort({
    actorUserId: auth.user.id,
    businessId,
    action: "set_plan",
    note,
    detail: { plan },
  });

  revalidatePath(langHref(lang, "/admin/businesses"));
  return { ok: true };
}

/* -------------------------------------------------------
   6) Optioneel: Admin kan ook subscriptions “latest” aanpassen
   (Alleen als je dit echt wil; anders laat je dit weg.)
   - super_admin only
------------------------------------------------------- */
export async function adminSetSubscriptionPlanAction(
  lang: Locale,
  businessId: string,
  plan: Plan,
  note?: string
): Promise<Result> {
  const auth = await getAuthedUser();
  if (!auth.ok) return auth;

  if (!isSuperAdmin(auth.user)) {
    return { ok: false, error: "Geen toegang (super_admin vereist)." };
  }

  const gate = getAdminClient();
  if (!gate.ok) return gate;

  const { admin } = gate;

  // Pak latest subscription en update die
  const { data: sub, error: sErr } = await admin
    .from("subscriptions")
    .select("id, business_id, created_at")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (sErr) return { ok: false, error: sErr.message };
  if (!sub?.id) return { ok: false, error: "Geen subscription record gevonden." };

  const { error: uErr } = await admin
    .from("subscriptions")
    .update({ plan } as any)
    .eq("id", sub.id);

  if (uErr) return { ok: false, error: uErr.message };

  await auditBestEffort({
    actorUserId: auth.user.id,
    businessId,
    action: "set_plan",
    note,
    detail: { plan, via: "subscriptions" },
  });

  revalidatePath(langHref(lang, "/admin/businesses"));
  return { ok: true };
}
