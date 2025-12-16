"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import type { Locale } from "@/i18n/config";
import { langHref } from "@/lib/lang-href";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { User } from "@supabase/supabase-js";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

type Ok<T> = { ok: true } & T;
type Fail = { ok: false; error: string };
export type Result<T = {}> = Ok<T> | Fail;

export type ListingStatus = "pending" | "active" | "inactive";
export type Plan = "starter" | "growth" | "pro";
export type SubscriptionStatus = "pending" | "active" | "inactive" | "expired";

export type AdminBusinessRow = {
  business_id: string;
  listing_id: string | null;

  business_name: string | null;
  island: string | null;

  listing_status: ListingStatus | null;
  deleted_at: string | null;

  subscription_plan: Plan | null;
  subscription_status: SubscriptionStatus | null;
  paid_until: string | null;
  subscription_created_at: string | null;
};

export type AdminBusinessesFilters = {
  q?: string | null;
  island?: string | null;
  status?: ListingStatus | "all" | null;
  plan?: Plan | "all" | null;
  showDeleted?: boolean; // true = ook deleted tonen
  expired?: "all" | "only" | "hide";
};

function ok<T>(data: T): Ok<T> {
  return { ok: true, ...data };
}

function fail(error: unknown): Fail {
  return { ok: false, error: error instanceof Error ? error.message : String(error) };
}

/* ------------------------------------------------------------------ */
/* Auth / Role                                                        */
/* ------------------------------------------------------------------ */

function isSuperAdmin(user: User) {
  // 1) via app_metadata role
  const role = (user.app_metadata as any)?.role;
  if (role === "super_admin" || role === "superadmin") return true;

  // 2) via env list (comma separated)
  const raw = process.env.SUPER_ADMIN_EMAILS || process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS;
  const emails =
    raw?.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean) ?? [];

  const email = (user.email ?? "").toLowerCase();
  if (email && emails.includes(email)) return true;

  return false;
}

async function requireSuperAdmin() {
  const sb = await supabaseServer();
  const { data, error } = await sb.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Niet ingelogd.");
  if (!isSuperAdmin(data.user)) throw new Error("Geen toegang.");
  return data.user;
}

/* ------------------------------------------------------------------ */
/* Audit (best effort, never crashes your action)                      */
/* ------------------------------------------------------------------ */

async function auditModerationBestEffort(payload: {
  actor_user_id: string;
  action: string;
  entity: "business" | "listing" | "subscription";
  entity_id: string;
  meta?: Record<string, unknown>;
}) {
  try {
    const admin = supabaseAdmin();
    // Als je tabel anders heet: pas hier aan.
    // Best effort: als de tabel niet bestaat of RLS blokkeert: silently ignore.
    await admin.from("moderation_audit").insert({
      actor_user_id: payload.actor_user_id,
      action: payload.action,
      entity: payload.entity,
      entity_id: payload.entity_id,
      meta: payload.meta ?? {},
      created_at: new Date().toISOString(),
    });
  } catch {
    // bewust leeg: audit mag nooit je admin-actie breken
  }
}

function adminBusinessesPath(lang: Locale) {
  return langHref(lang, "/admin/businesses");
}

/* ------------------------------------------------------------------ */
/* Actions                                                            */
/* ------------------------------------------------------------------ */

export async function adminListBusinessesAction(
  lang: Locale,
  filters?: AdminBusinessesFilters
): Promise<Result<{ rows: AdminBusinessRow[] }>> {
  try {
    await requireSuperAdmin();
    const admin = supabaseAdmin();

    let q = admin
      .from("admin_business_listings_view")
      .select("*")
      .order("business_name", { ascending: true });

    // search
    const needle = (filters?.q ?? "").trim();
    if (needle) {
      // ilike over multiple columns (works in PostgREST)
      q = q.or(
        `business_name.ilike.%${needle}%,business_id.ilike.%${needle}%,listing_id.ilike.%${needle}%`
      );
    }

    // island
    if (filters?.island && filters.island !== "all") {
      q = q.eq("island", filters.island);
    }

    // listing status
    if (filters?.status && filters.status !== "all") {
      q = q.eq("listing_status", filters.status);
    }

    // plan
    if (filters?.plan && filters.plan !== "all") {
      q = q.eq("subscription_plan", filters.plan);
    }

    // deleted
    if (!filters?.showDeleted) {
      q = q.is("deleted_at", null);
    }

    // expired filter (simple heuristic on subscription_status)
    if (filters?.expired === "only") {
      q = q.eq("subscription_status", "expired");
    } else if (filters?.expired === "hide") {
      q = q.neq("subscription_status", "expired");
    }

    const { data, error } = await q;
    if (error) return fail(error.message);

    return ok({ rows: (data ?? []) as AdminBusinessRow[] });
  } catch (e) {
    return fail(e);
  }
}

export async function adminSetListingPlanAction(
  lang: Locale,
  businessId: string,
  plan: Plan
): Promise<Result<{}>> {
  try {
    const user = await requireSuperAdmin();
    const admin = supabaseAdmin();

    // FK safety: business must exist
    const { data: b, error: bErr } = await admin
      .from("businesses")
      .select("id")
      .eq("id", businessId)
      .maybeSingle();

    if (bErr) return fail(bErr.message);
    if (!b?.id) return fail("Business bestaat niet (businessId klopt niet).");

    // Upsert subscription on business_id (requires UNIQUE(business_id) -> you already have it)
    const payload = {
      business_id: businessId,
      plan,
      status: "active" as SubscriptionStatus,
      ends_at: null,
      paid_until: null,
      created_at: new Date().toISOString(),
    };

    const { error: upErr } = await admin
      .from("subscriptions")
      .upsert(payload, { onConflict: "business_id" });

    if (upErr) return fail(upErr.message);

    await auditModerationBestEffort({
      actor_user_id: user.id,
      action: "set_subscription_plan",
      entity: "subscription",
      entity_id: businessId,
      meta: { plan },
    });

    revalidatePath(adminBusinessesPath(lang));
    return ok({});
  } catch (e) {
    return fail(e);
  }
}

export async function adminSetListingStatusAction(
  lang: Locale,
  listingId: string,
  status: ListingStatus
): Promise<Result<{}>> {
  try {
    const user = await requireSuperAdmin();
    const admin = supabaseAdmin();

    const { error } = await admin
      .from("business_listings")
      .update({ status })
      .eq("id", listingId);

    if (error) return fail(error.message);

    await auditModerationBestEffort({
      actor_user_id: user.id,
      action: "set_listing_status",
      entity: "listing",
      entity_id: listingId,
      meta: { status },
    });

    revalidatePath(adminBusinessesPath(lang));
    return ok({});
  } catch (e) {
    return fail(e);
  }
}

export async function adminSoftDeleteBusinessAction(
  lang: Locale,
  listingId: string
): Promise<Result<{}>> {
  try {
    const user = await requireSuperAdmin();
    const admin = supabaseAdmin();

    const { error } = await admin
      .from("business_listings")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", listingId);

    if (error) return fail(error.message);

    await auditModerationBestEffort({
      actor_user_id: user.id,
      action: "soft_delete_listing",
      entity: "listing",
      entity_id: listingId,
    });

    revalidatePath(adminBusinessesPath(lang));
    return ok({});
  } catch (e) {
    return fail(e);
  }
}

export async function adminRestoreBusinessAction(
  lang: Locale,
  listingId: string
): Promise<Result<{}>> {
  try {
    const user = await requireSuperAdmin();
    const admin = supabaseAdmin();

    const { error } = await admin
      .from("business_listings")
      .update({ deleted_at: null })
      .eq("id", listingId);

    if (error) return fail(error.message);

    await auditModerationBestEffort({
      actor_user_id: user.id,
      action: "restore_listing",
      entity: "listing",
      entity_id: listingId,
    });

    revalidatePath(adminBusinessesPath(lang));
    return ok({});
  } catch (e) {
    return fail(e);
  }
}
