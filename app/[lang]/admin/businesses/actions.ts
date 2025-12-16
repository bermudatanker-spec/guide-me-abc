"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import type { Locale } from "@/i18n/config";
import { langHref } from "@/lib/lang-href";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type ListingStatus = "pending" | "active" | "inactive";
export type Plan = "starter" | "growth" | "pro";

type Ok<T = {}> = { ok: true } & T;
type Fail = { ok: false; error: string };
export type Result<T = {}> = Ok<T> | Fail;

function ok<T>(data?: T): Ok<T> {
  return { ok: true, ...(data ?? ({} as T)) };
}
function fail(error: unknown): Fail {
  return { ok: false, error: error instanceof Error ? error.message : String(error) };
}

function adminPath(lang: Locale) {
  return langHref(lang, "/admin/businesses");
}

function nowIso() {
  return new Date().toISOString();
}

/** ✅ TS-safe super admin gate */
async function requireSuperAdmin(): Promise<string> {
  const sb: any = await supabaseServer();
  const { data, error } = await sb.auth.getUser();

  if (error || !data?.user) {
    throw new Error("Niet ingelogd");
  }

  const role =
    (data.user.app_metadata as any)?.role ??
    (data.user.user_metadata as any)?.role ??
    "";

  if (!["super_admin", "superadmin"].includes(String(role).toLowerCase())) {
    throw new Error("Geen toegang");
  }

  return data.user.id;
}

/** (best effort) probeer óók subscriptions upsert, maar faal niet als table niet bestaat */
async function upsertSubscriptionBestEffort(admin: any, businessId: string, plan: Plan) {
  try {
    await admin
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
  } catch {
    // ignore
  }
}

/** ✅ ADMIN: status zetten op alle listings van business (actieve / niet-deleted) */
export async function adminSetListingStatusAction(
  lang: Locale,
  businessId: string,
  status: ListingStatus
): Promise<Result> {
  try {
    await requireSuperAdmin();
    const admin = supabaseAdmin();

    const { error } = await admin
      .from("business_listings")
      .update({ status } as any)
      .eq("business_id", businessId)
      .is("deleted_at", null);

    if (error) return fail(error.message);

    revalidatePath(adminPath(lang));
    return ok({});
  } catch (e) {
    return fail(e);
  }
}

/** ✅ ADMIN: plan zetten (BELANGRIJK: update business_listings.subscription_plan) */
export async function adminSetListingPlanAction(
  lang: Locale,
  businessId: string,
  plan: Plan
): Promise<Result> {
  try {
    await requireSuperAdmin();
    const admin = supabaseAdmin();

    // ✅ 1) update legacy/source-of-truth kolom die jouw UI leest
    const { error } = await admin
      .from("business_listings")
      .update({ subscription_plan: plan } as any)
      .eq("business_id", businessId)
      .is("deleted_at", null);

    if (error) return fail(error.message);

    // ✅ 2) best effort sync naar subscriptions (optioneel)
    await upsertSubscriptionBestEffort(admin, businessId, plan);

    revalidatePath(adminPath(lang));
    return ok({});
  } catch (e) {
    return fail(e);
  }
}

/** ✅ ADMIN: soft delete business + listings */
export async function adminSoftDeleteBusinessAction(
  lang: Locale,
  businessId: string
): Promise<Result> {
  try {
    await requireSuperAdmin();
    const admin = supabaseAdmin();
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

    revalidatePath(adminPath(lang));
    return ok({});
  } catch (e) {
    return fail(e);
  }
}

/** ✅ ADMIN: restore business + listings */
export async function adminRestoreBusinessAction(
  lang: Locale,
  businessId: string
): Promise<Result> {
  try {
    await requireSuperAdmin();
    const admin = supabaseAdmin();

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

    revalidatePath(adminPath(lang));
    return ok({});
  } catch (e) {
    return fail(e);
  }
}

/* -------------------------------------------------------
   Owner exports (alleen zodat imports nooit breken)
   (Admin pagina gebruikt deze niet, maar voorkomt “bestaat niet” errors)
-------------------------------------------------------- */

export async function softDeleteBusinessAction(
  lang: Locale,
  businessId: string
): Promise<Result> {
  // voor admin-only projecten: laat admin actie uitvoeren
  return adminSoftDeleteBusinessAction(lang, businessId);
}

export async function undoDeleteBusinessAction(
  lang: Locale,
  businessId: string
): Promise<Result> {
  return adminRestoreBusinessAction(lang, businessId);
}

export async function setListingStatusAction(): Promise<Result> {
  return fail("Niet beschikbaar via owner op admin route.");
}

export async function setListingPlanAction(): Promise<Result> {
  return fail("Niet beschikbaar via owner op admin route.");
}

export async function softDeleteListingAction(): Promise<Result> {
  return fail("Niet beschikbaar via owner op admin route.");
}