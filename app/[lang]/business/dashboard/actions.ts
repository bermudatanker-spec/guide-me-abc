"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import type { Locale } from "@/i18n/config";
import { langHref } from "@/lib/lang-href";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/* -------------------------------------------------------
   Types
-------------------------------------------------------- */
type Ok<T = {}> = { ok: true } & T;
type Fail = { ok: false; error: string };
export type Result<T = {}> = Ok<T> | Fail;

export type ListingStatus = "pending" | "active" | "inactive";
export type Plan = "starter" | "growth" | "pro";

// ✅ ADMIN: verified toggle (accept listingId OR businessId)
export async function adminSetListingVerifiedAction(
  lang: Locale,
  idOrBusinessId: string,
  verified: boolean
): Promise<Result> {
  try {
    const auth = await getAuthedUser();
    if (!auth.ok) return auth;
    if (!isSuperAdmin(auth.user)) return fail("Geen toegang (super_admin vereist).");

    const gate = getAdminClient();
    if (!gate.ok) return gate;

    const listingId = await resolveListingId(gate.admin, idOrBusinessId);

    const patch = verified
      ? { is_verified: true, verified_at: nowIso() }
      : { is_verified: false, verified_at: null };

    const { error } = await gate.admin
      .from("business_listings")
      .update(patch as any)
      .eq("id", listingId);

    if (error) return fail(error.message);

    // audit best effort
    const { data: row } = await gate.admin
      .from("business_listings")
      .select("business_id")
      .eq("id", listingId)
      .maybeSingle();

    if (row?.business_id) {
      await auditBestEffort({
        actorUserId: auth.user.id,
        businessId: row.business_id,
        action: "set_status", // of maak een aparte audit action "set_verified" als je wil
        detail: { verified },
      });
    }

    // revalidate plekken waar badge zichtbaar is
    revalidatePath(adminBusinessesPath(lang));
    revalidatePath(dashboardPath(lang));
    // mini-site pages zijn dynamisch per id — dashboard refresh is meestal genoeg.
    return ok({});
  } catch (e) {
    return fail(e);
  }
}

type AuditAction = "delete" | "undo_delete" | "set_status" | "set_plan" | "set_verified";

function ok<T>(data?: T): Ok<T> {
  return { ok: true, ...(data ?? ({} as T)) };
}
function fail(error: unknown): Fail {
  return { ok: false, error: error instanceof Error ? error.message : String(error) };
}

/* -------------------------------------------------------
   Role helpers
-------------------------------------------------------- */
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

function adminBusinessesPath(lang: Locale) {
  return langHref(lang, "/admin/businesses");
}
function dashboardPath(lang: Locale) {
  return langHref(lang, "/business/dashboard");
}

/* -------------------------------------------------------
   Auth helper
-------------------------------------------------------- */
async function getAuthedUser(): Promise<Result<{ user: any; supabase: any }>> {
  const supabase: any = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return fail(error.message);
  if (!data?.user) return fail("Niet ingelogd.");
  return ok({ user: data.user, supabase });
}

/* -------------------------------------------------------
   Admin client safe wrapper
-------------------------------------------------------- */
function getAdminClient(): Result<{ admin: any }> {
  try {
    const admin = supabaseAdmin();
    return ok({ admin });
  } catch (e: any) {
    return fail(
      e?.message ??
        "Kon admin client niet initialiseren (check SUPABASE_SERVICE_ROLE_KEY)."
    );
  }
}

/* -------------------------------------------------------
   Audit (best effort)
-------------------------------------------------------- */
async function auditBestEffort(input: {
  actorUserId: string;
  businessId: string;
  action: AuditAction;
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
      detail: input.detail ?? null,
    });
  } catch {
    // nooit blocken
  }
}

/* -------------------------------------------------------
   Resolve helpers
-------------------------------------------------------- */
async function resolveListingId(admin: any, idOrBusinessId: string) {
  // 1) probeer als listing_id
  const { data: byId, error: e1 } = await admin
    .from("business_listings")
    .select("id")
    .eq("id", idOrBusinessId)
    .maybeSingle();

  if (e1) throw new Error(e1.message);
  if (byId?.id) return byId.id;

  // 2) anders als business_id -> pak nieuwste listing
  const { data: byBiz, error: e2 } = await admin
    .from("business_listings")
    .select("id")
    .eq("business_id", idOrBusinessId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (e2) throw new Error(e2.message);
  if (!byBiz?.id) throw new Error("Listing niet gevonden voor business.");
  return byBiz.id;
}

async function resolveBusinessIdFromListingOrBusinessId(
  sb: any,
  idOrBusinessId: string
): Promise<string> {
  // 1) als het een businessId is, bestaat er een business_listings rij?
  const { data: byBiz, error: e0 } = await sb
    .from("business_listings")
    .select("business_id")
    .eq("business_id", idOrBusinessId)
    .limit(1)
    .maybeSingle();

  if (e0) throw new Error(e0.message);
  if (byBiz?.business_id) return byBiz.business_id;

  // 2) anders treat als listingId
  const { data: byListing, error: e1 } = await sb
    .from("business_listings")
    .select("business_id")
    .eq("id", idOrBusinessId)
    .maybeSingle();

  if (e1) throw new Error(e1.message);
  if (!byListing?.business_id) throw new Error("Business niet gevonden voor listing.");
  return byListing.business_id;
}

/* -------------------------------------------------------
   Owner access check (RLS) voor business
-------------------------------------------------------- */
async function ensureOwnerOrAdmin(businessId: string, user: any): Promise<Result> {
  if (!businessId) return fail("businessId ontbreekt.");

  if (isSuperAdmin(user)) return ok({});

  const sb: any = await createSupabaseServerClient();
  const { data, error } = await sb
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return fail(error.message);
  if (!data?.id) return fail("Geen toegang.");
  return ok({});
}

/* -------------------------------------------------------
   ✅ EXPORTS (Admin)
-------------------------------------------------------- */

// ADMIN: status op listing (accept listingId OR businessId)
export async function adminSetListingStatusAction(
  lang: Locale,
  idOrBusinessId: string,
  status: ListingStatus
): Promise<Result> {
  try {
    const auth = await getAuthedUser();
    if (!auth.ok) return auth;

    const { user } = auth;
    if (!isSuperAdmin(user)) return fail("Geen toegang (super_admin vereist).");

    const gate = getAdminClient();
    if (!gate.ok) return gate;

    const { admin } = gate;

    const listingId = await resolveListingId(admin, idOrBusinessId);

    const { error } = await admin
      .from("business_listings")
      .update({ status } as any)
      .eq("id", listingId);

    if (error) return fail(error.message);

    // audit best effort
    const { data: row } = await admin
      .from("business_listings")
      .select("business_id")
      .eq("id", listingId)
      .maybeSingle();

    if (row?.business_id) {
      await auditBestEffort({
        actorUserId: user.id,
        businessId: row.business_id,
        action: "set_status",
        detail: { status },
      });
    }

    revalidatePath(adminBusinessesPath(lang));
    revalidatePath(dashboardPath(lang));
    return ok({});
  } catch (e) {
    return fail(e);
  }
}

// ADMIN: plan per business
// ✅ schrijft naar subscriptions
// ✅ schrijft óók naar business_listings.subscription_plan (jouw UI leest dit!)
export async function adminSetListingPlanAction(
  lang: Locale,
  businessId: string,
  plan: Plan
): Promise<Result> {
  try {
    const auth = await getAuthedUser();
    if (!auth.ok) return auth;

    const { user } = auth;
    if (!isSuperAdmin(user)) return fail("Geen toegang (super_admin vereist).");

    const gate = getAdminClient();
    if (!gate.ok) return gate;

    const { admin } = gate;

    // 1) upsert subscriptions
    const { error: sErr } = await admin
      .from("subscriptions")
      .upsert(
        {
          business_id: businessId,
          plan,
          status: "active",
          ends_at: null,
          paid_until: null,
        } as any,
        { onConflict: "business_id" }
      );

    if (sErr) return fail(sErr.message);

    // 2) update business_listings.subscription_plan zodat UI mee verandert
    const { error: lErr } = await admin
      .from("business_listings")
      .update({ subscription_plan: plan } as any)
      .eq("business_id", businessId)
      .is("deleted_at", null);

    if (lErr) return fail(lErr.message);

    await auditBestEffort({
      actorUserId: user.id,
      businessId,
      action: "set_plan",
      detail: { plan },
    });

    revalidatePath(adminBusinessesPath(lang));
    revalidatePath(dashboardPath(lang));
    return ok({});
  } catch (e) {
    return fail(e);
  }
}

// ADMIN: soft delete business (businessId)
export async function adminSoftDeleteBusinessAction(
  lang: Locale,
  businessId: string
): Promise<Result> {
  try {
    const auth = await getAuthedUser();
    if (!auth.ok) return auth;

    const { user } = auth;
    if (!isSuperAdmin(user)) return fail("Geen toegang (super_admin vereist).");

    const gate = getAdminClient();
    if (!gate.ok) return gate;

    const { admin } = gate;

    const ts = nowIso();

    const { error: bErr } = await admin
      .from("businesses")
      .update({ deleted_at: ts } as any)
      .eq("id", businessId);
    if (bErr) return fail(bErr.message);

    const { error: lErr } = await admin
      .from("business_listings")
      .update({ deleted_at: ts } as any)
      .eq("business_id", businessId);
    if (lErr) return fail(lErr.message);

    await auditBestEffort({
      actorUserId: user.id,
      businessId,
      action: "delete",
      detail: { via: "adminSoftDeleteBusinessAction" },
    });

    revalidatePath(adminBusinessesPath(lang));
    revalidatePath(dashboardPath(lang));
    return ok({});
  } catch (e) {
    return fail(e);
  }
}

// ADMIN: restore business (businessId)
export async function adminRestoreBusinessAction(
  lang: Locale,
  businessId: string
): Promise<Result> {
  try {
    const auth = await getAuthedUser();
    if (!auth.ok) return auth;

    const { user } = auth;
    if (!isSuperAdmin(user)) return fail("Geen toegang (super_admin vereist).");

    const gate = getAdminClient();
    if (!gate.ok) return gate;

    const { admin } = gate;

    const { error: bErr } = await admin
      .from("businesses")
      .update({ deleted_at: null } as any)
      .eq("id", businessId);
    if (bErr) return fail(bErr.message);

    const { error: lErr } = await admin
      .from("business_listings")
      .update({ deleted_at: null } as any)
      .eq("business_id", businessId);
    if (lErr) return fail(lErr.message);

    await auditBestEffort({
      actorUserId: user.id,
      businessId,
      action: "undo_delete",
      detail: { via: "adminRestoreBusinessAction" },
    });

    revalidatePath(adminBusinessesPath(lang));
    revalidatePath(dashboardPath(lang));
    return ok({});
  } catch (e) {
    return fail(e);
  }
}

/* -------------------------------------------------------
   ✅ EXPORTS (Owner / dashboard)
-------------------------------------------------------- */

// Owner: status (werkt alleen als RLS dit toelaat)
export async function setListingStatusAction(
  lang: Locale,
  listingId: string,
  status: ListingStatus
): Promise<Result> {
  try {
    const auth = await getAuthedUser();
    if (!auth.ok) return auth;

    const { supabase } = auth;

    const { error } = await supabase
      .from("business_listings")
      .update({ status } as any)
      .eq("id", listingId);

    if (error) return fail(error.message);

    revalidatePath(dashboardPath(lang));
    return ok({});
  } catch (e) {
    return fail(e);
  }
}

/**
 * Owner: plan
 * - owners mogen meestal niet plan wijzigen
 * - daarom: alleen admin toegestaan
 * - accepteert "listingId OR businessId"
 */
export async function setListingPlanAction(
  lang: Locale,
  idOrBusinessId: string,
  plan: Plan
): Promise<Result> {
  try {
    const auth = await getAuthedUser();
    if (!auth.ok) return auth;

    if (!isSuperAdmin(auth.user)) {
      return fail("Alleen admin kan plan aanpassen.");
    }

    const businessId = await resolveBusinessIdFromListingOrBusinessId(
      auth.supabase,
      idOrBusinessId
    );

    return await adminSetListingPlanAction(lang, businessId, plan);
  } catch (e) {
    return fail(e);
  }
}

// Owner: soft delete listing
export async function softDeleteListingAction(
  lang: Locale,
  listingId: string
): Promise<Result> {
  try {
    const auth = await getAuthedUser();
    if (!auth.ok) return auth;

    const { supabase } = auth;

    const { error } = await supabase
      .from("business_listings")
      .update({ deleted_at: nowIso() } as any)
      .eq("id", listingId);

    if (error) return fail(error.message);

    revalidatePath(dashboardPath(lang));
    return ok({});
  } catch (e) {
    return fail(e);
  }
}

/* -------------------------------------------------------
   ✅ BUSINESS soft delete / undo delete
-------------------------------------------------------- */

export async function softDeleteBusinessAction(
  lang: Locale,
  businessId: string
): Promise<Result> {
  try {
    const auth = await getAuthedUser();
    if (!auth.ok) return auth;

    const access = await ensureOwnerOrAdmin(businessId, auth.user);
    if (!access.ok) return access;

    // admin route
    if (isSuperAdmin(auth.user)) {
      return await adminSoftDeleteBusinessAction(lang, businessId);
    }

    const ts = nowIso();
    const { supabase } = auth;

    const { error: bErr } = await supabase
      .from("businesses")
      .update({ deleted_at: ts } as any)
      .eq("id", businessId)
      .eq("user_id", auth.user.id);

    if (bErr) return fail(bErr.message);

    const { error: lErr } = await supabase
      .from("business_listings")
      .update({ deleted_at: ts } as any)
      .eq("business_id", businessId);

    if (lErr) return fail(lErr.message);

    revalidatePath(dashboardPath(lang));
    return ok({});
  } catch (e) {
    return fail(e);
  }
}

// ✅ Export (was bij jou essentieel)
export async function undoDeleteBusinessAction(
  lang: Locale,
  businessId: string
): Promise<Result> {
  try {
    const auth = await getAuthedUser();
    if (!auth.ok) return auth;

    const access = await ensureOwnerOrAdmin(businessId, auth.user);
    if (!access.ok) return access;

    if (isSuperAdmin(auth.user)) {
      return await adminRestoreBusinessAction(lang, businessId);
    }

    const { supabase } = auth;

    const { error: bErr } = await supabase
      .from("businesses")
      .update({ deleted_at: null } as any)
      .eq("id", businessId)
      .eq("user_id", auth.user.id);

    if (bErr) return fail(bErr.message);

    const { error: lErr } = await supabase
      .from("business_listings")
      .update({ deleted_at: null } as any)
      .eq("business_id", businessId);

    if (lErr) return fail(lErr.message);

    revalidatePath(dashboardPath(lang));
    return ok({});
  } catch (e) {
    return fail(e);
  }
}