"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import type { Locale } from "@/i18n/config";
import { langHref } from "@/lib/lang-href";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { User } from "@supabase/supabase-js";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

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

  listing_status: ListingStatus | null; // uit view: bl.status as listing_status
  deleted_at: string | null; // uit view: bl.deleted_at

  subscription_plan: Plan | null; // uit view: ls.plan as subscription_plan
  subscription_status: SubscriptionStatus | null; // uit view: ls.status as subscription_status
  paid_until: string | null; // uit view: ls.paid_until
  subscription_created_at: string | null; // uit view: ls.created_at as subscription_created_at
};

export type AdminListFilters = {
  q?: string; // search name / island / ids
  island?: string; // "aruba" | "bonaire" | "curacao" | ...
  status?: ListingStatus | "all";
  plan?: Plan | "all";
  includeDeleted?: boolean; // true => toon ook deleted_at != null
  expired?: "all" | "only" | "hide"; // filter op subscription_status == "expired"
};

type AuditAction =
  | "delete"
  | "restore"
  | "set_listing_status"
  | "set_plan";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getRoles(user: User): string[] {
  const meta: any = user?.app_metadata ?? {};
  const raw = meta.roles ?? meta.role ?? (user as any)?.role ?? [];
  const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return arr.map((r) => String(r).trim().toLowerCase()).filter(Boolean);
}

function isSuperAdmin(user: User): boolean {
  const roles = getRoles(user);
  return roles.includes("super_admin") || roles.includes("superadmin");
}

async function getAuthedUser(): Promise<Result<{ user: User }>> {
  const sb: any = await supabaseServer();
  const { data, error } = await sb.auth.getUser();
  if (error) return { ok: false, error: error.message };
  if (!data?.user) return { ok: false, error: "Niet ingelogd." };
  return { ok: true, user: data.user };
}

/** Best-effort audit: mag je flow NOOIT breken */
async function auditModerationBestEffort(input: {
  actorUserId: string;
  businessId: string;
  action: AuditAction;
  note?: string | null;
  meta?: Record<string, unknown>;
}) {
  try {
    const admin: any = supabaseAdmin();
    await admin.from("audit_business_moderation").insert({
      business_id: input.businessId,
      actor_user_id: input.actorUserId,
      action: input.action,
      note: input.note ?? null,
      meta: input.meta ?? null,
    });
  } catch (e) {
    // table/types mogen ontbreken -> bewust stil
    console.warn("[audit_business_moderation] best-effort failed:", e);
  }
}

function nowIso() {
  return new Date().toISOString();
}

function norm(s: unknown) {
  return String(s ?? "").trim().toLowerCase();
}

function isExpiredRow(r: AdminBusinessRow): boolean {
  // primaire bron: subscription_status
  if (r.subscription_status === "expired") return true;
  // fallback: paid_until in verleden
  if (!r.paid_until) return false;
  const t = Date.parse(r.paid_until);
  if (Number.isNaN(t)) return false;
  return t < Date.now();
}

/* -------------------------------------------------------------------------- */
/* Actions                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Admin: lijst businesses (via view).
 * View naam die we gebruiken: public.admin_business_listings_view
 */
export async function adminListBusinessesAction(
  lang: Locale,
  filters: AdminListFilters = {}
): Promise<Result<{ rows: AdminBusinessRow[]; counts: Record<string, number> }>> {
  const auth = await getAuthedUser();
  if (!auth.ok) return auth;
  if (!isSuperAdmin(auth.user)) return { ok: false, error: "Geen toegang." };

  try {
    const admin: any = supabaseAdmin();

    let q = admin
      .from("admin_business_listings_view")
      .select(
        [
          "business_id",
          "listing_id",
          "business_name",
          "island",
          "listing_status",
          "deleted_at",
          "subscription_plan",
          "subscription_status",
          "paid_until",
          "subscription_created_at",
        ].join(",")
      );

    // deleted filter
    if (!filters.includeDeleted) {
      q = q.is("deleted_at", null);
    }

    // island filter
    if (filters.island && filters.island !== "all") {
      q = q.eq("island", filters.island);
    }

    // status filter (listing_status)
    if (filters.status && filters.status !== "all") {
      q = q.eq("listing_status", filters.status);
    }

    // plan filter (subscription_plan)
    if (filters.plan && filters.plan !== "all") {
      q = q.eq("subscription_plan", filters.plan);
    }

    // expired filter
    if (filters.expired === "only") {
      q = q.eq("subscription_status", "expired");
    } else if (filters.expired === "hide") {
      q = q.neq("subscription_status", "expired");
    }

    // search
    const search = norm(filters.q);
    if (search) {
      // ilike op name/island + ids als tekst
      q = q.or(
        [
          `business_name.ilike.%${search}%`,
          `island.ilike.%${search}%`,
          `business_id.ilike.%${search}%`,
          `listing_id.ilike.%${search}%`,
        ].join(",")
      );
    }

    q = q.order("business_name", { ascending: true });

    const { data, error } = await q;
    if (error) return { ok: false, error: error.message };

    const rows: AdminBusinessRow[] = (data ?? []) as AdminBusinessRow[];

    // simpele counts voor je cards
    const counts = {
      total: rows.length,
      active: rows.filter((r) => r.listing_status === "active").length,
      inactive: rows.filter((r) => r.listing_status === "inactive").length,
      deleted: rows.filter((r) => Boolean(r.deleted_at)).length,
      paid: rows.filter((r) => (r.subscription_plan ?? null) !== null && !isExpiredRow(r)).length,
      free: rows.filter((r) => (r.subscription_plan ?? null) === null || isExpiredRow(r)).length,
      expired: rows.filter((r) => isExpiredRow(r)).length,
    };

    return { ok: true, rows, counts };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Onbekende fout." };
  } finally {
    revalidatePath(langHref(lang, "/admin/businesses"));
  }
}

/**
 * Admin: listing status wijzigen (business_listings.status)
 */
export async function adminSetListingStatusAction(
  lang: Locale,
  businessId: string,
  status: ListingStatus
): Promise<Result> {
  const auth = await getAuthedUser();
  if (!auth.ok) return auth;
  if (!isSuperAdmin(auth.user)) return { ok: false, error: "Geen toegang." };
  if (!businessId) return { ok: false, error: "businessId ontbreekt." };

  try {
    const admin: any = supabaseAdmin();

    // update listing status op business_listings via business_id
    const { error } = await admin
      .from("business_listings")
      .update({ status })
      .eq("business_id", businessId);

    if (error) return { ok: false, error: error.message };

    await auditModerationBestEffort({
      actorUserId: auth.user.id,
      businessId,
      action: "set_listing_status",
      meta: { status },
    });

    revalidatePath(langHref(lang, "/admin/businesses"));
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Onbekende fout." };
  }
}

/**
 * Admin: plan zetten via subscriptions upsert (FK-safety op businesses.id)
 * Let op: subscriptions constraints:
 *  - plan in ('starter','growth','pro')
 *  - status in ('pending','active','inactive','expired')
 */
export async function adminSetListingPlanAction(
  lang: Locale,
  businessId: string,
  plan: Plan
): Promise<Result> {
  const auth = await getAuthedUser();
  if (!auth.ok) return auth;
  if (!isSuperAdmin(auth.user)) return { ok: false, error: "Geen toegang." };
  if (!businessId) return { ok: false, error: "businessId ontbreekt." };

  try {
    const admin: any = supabaseAdmin();

    // 1) FK-safety: business moet bestaan
    const { data: b, error: bErr } = await admin
      .from("businesses")
      .select("id")
      .eq("id", businessId)
      .maybeSingle();

    if (bErr) return { ok: false, error: bErr.message };
    if (!b?.id) return { ok: false, error: "Business bestaat niet (id klopt niet)." };

    // 2) Upsert subscription op business_id
    // Tip: hiervoor moet je UNIQUE(business_id) hebben (of upsert faalt / dupes)
    const payload = {
      business_id: businessId,
      plan,
      status: "active" as SubscriptionStatus, // altijd allowed door constraint
      ends_at: null,
      paid_until: null,
    };

    const { error: upErr } = await admin
      .from("subscriptions")
      .upsert(payload, { onConflict: "business_id" });

    if (upErr) return { ok: false, error: upErr.message };

    // 3) (optioneel) probeer businesses.plan mee te syncen (best-effort)
    try {
      await admin.from("businesses").update({ plan }).eq("id", businessId);
    } catch {
      // kolom kan ontbreken -> negeren
    }

    await auditModerationBestEffort({
      actorUserId: auth.user.id,
      businessId,
      action: "set_plan",
      meta: { plan },
    });

    revalidatePath(langHref(lang, "/admin/businesses"));
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Onbekende fout." };
  }
}

/**
 * Admin: soft delete business + listings (set deleted_at)
 */
export async function adminSoftDeleteBusinessAction(
  lang: Locale,
  businessId: string,
  note?: string
): Promise<Result> {
  const auth = await getAuthedUser();
  if (!auth.ok) return auth;
  if (!isSuperAdmin(auth.user)) return { ok: false, error: "Geen toegang." };
  if (!businessId) return { ok: false, error: "businessId ontbreekt." };

  try {
    const admin: any = supabaseAdmin();
    const ts = nowIso();

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

    await auditModerationBestEffort({
      actorUserId: auth.user.id,
      businessId,
      action: "delete",
      note: note ?? null,
    });

    revalidatePath(langHref(lang, "/admin/businesses"));
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Onbekende fout." };
  }
}

/**
 * Admin: restore soft deleted business + listings (set deleted_at null)
 */
export async function adminRestoreBusinessAction(
  lang: Locale,
  businessId: string,
  note?: string
): Promise<Result> {
  const auth = await getAuthedUser();
  if (!auth.ok) return auth;
  if (!isSuperAdmin(auth.user)) return { ok: false, error: "Geen toegang." };
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

    await auditModerationBestEffort({
      actorUserId: auth.user.id,
      businessId,
      action: "restore",
      note: note ?? null,
    });

    revalidatePath(langHref(lang, "/admin/businesses"));
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Onbekende fout." };
  }
}