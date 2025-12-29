"use server";

import "server-only";
import { revalidatePath } from "next/cache";

import type { Locale } from "@/i18n/config";
import { langHref } from "@/lib/lang-href";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Ok<T = {}> = { ok: true } & T;
type Fail = { ok: false; error: string };
export type Result<T = {}> = Ok<T> | Fail;

export type ListingStatus = "pending" | "active" | "inactive";
export type Plan = "starter" | "growth" | "pro";

function ok<T>(data?: T): Ok<T> {
  return { ok: true, ...(data ?? ({} as T)) };
}
function fail(error: unknown): Fail {
  return {
    ok: false,
    error: error instanceof Error ? error.message : String(error),
  };
}

function adminPath(lang: Locale) {
  return langHref(lang, "/admin/businesses");
}
function dashboardPath(lang: Locale) {
  return langHref(lang, "/business/dashboard");
}

async function requireSuperAdmin() {
  const sb = await supabaseServer();
  const { data, error } = await sb.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data?.user) throw new Error("Niet ingelogd.");

  const role = (
    (data.user.app_metadata as any)?.role ??
    (data.user as any)?.role ??
    ""
  )
    .toString()
    .toLowerCase();

  if (!(role === "super_admin" || role === "superadmin")) {
    throw new Error("Geen toegang.");
  }

  return data.user.id;
}

/**
 * ✅ Resolve helper: accepteert listing.id OF business_id
 * en geeft altijd { listingId, businessId } terug.
 */
async function resolveListingAndBusinessId(admin: any, idOrBusinessId: string) {
  const { data, error } = await admin
    .from("business_listings")
    .select("id, business_id")
    .or(`id.eq.${idOrBusinessId},business_id.eq.${idOrBusinessId}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data?.id || !data?.business_id) {
    throw new Error("Listing/business niet gevonden.");
  }
  return { listingId: data.id as string, businessId: data.business_id as string };
}

/** ✅ Admin: status aanpassen op business_listings (listingId OR businessId) */
export async function adminSetListingStatusAction(
  lang: Locale,
  idOrBusinessId: string,
  status: ListingStatus
): Promise<Result> {
  try {
    await requireSuperAdmin();
    const admin = supabaseAdmin();

    const { listingId } = await resolveListingAndBusinessId(admin, idOrBusinessId);

    const { error } = await admin
      .from("business_listings")
      .update({ status } as any)
      .eq("id", listingId);

    if (error) return fail(error.message);

    revalidatePath(adminPath(lang));
    revalidatePath(dashboardPath(lang));
    return ok({});
  } catch (e) {
    return fail(e);
  }
}

/** ✅ Admin: verified/unverified (listingId OR businessId) */
export async function adminSetListingVerifiedAction(
  lang: Locale,
  idOrBusinessId: string,
  verified: boolean
): Promise<Result> {
  try {
    await requireSuperAdmin();
    const admin = supabaseAdmin();

    const { listingId } = await resolveListingAndBusinessId(admin, idOrBusinessId);
    const verified_at = verified ? new Date().toISOString() : null;

    const { error } = await admin
      .from("business_listings")
      .update({ is_verified: verified, verified_at } as any)
      .eq("id", listingId);

    if (error) return fail(error.message);

    revalidatePath(adminPath(lang));
    revalidatePath(dashboardPath(lang));
    return ok({});
  } catch (e) {
    return fail(e);
  }
}

/**
 * ✅ Admin: plan aanpassen via subscriptions
 * (listingId OR businessId -> resolved naar businessId)
 */
export async function adminSetListingPlanAction(
  lang: Locale,
  idOrBusinessId: string,
  plan: Plan
): Promise<Result> {
  try {
    await requireSuperAdmin();
    const admin = supabaseAdmin();

    const { businessId } = await resolveListingAndBusinessId(admin, idOrBusinessId);

    const { error } = await admin
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

    if (error) return fail(error.message);

    revalidatePath(adminPath(lang));
    revalidatePath(dashboardPath(lang));
    return ok({});
  } catch (e) {
    return fail(e);
  }
}

/** ✅ Admin: soft delete op businesses + business_listings (listingId OR businessId) */
export async function adminSoftDeleteBusinessAction(
  lang: Locale,
  idOrBusinessId: string
): Promise<Result> {
  try {
    await requireSuperAdmin();
    const admin = supabaseAdmin();
    const ts = new Date().toISOString();

    const { businessId } = await resolveListingAndBusinessId(admin, idOrBusinessId);

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
    revalidatePath(dashboardPath(lang));
    return ok({});
  } catch (e) {
    return fail(e);
  }
}

/** ✅ Admin: restore soft delete (listingId OR businessId) */
export async function adminRestoreBusinessAction(
  lang: Locale,
  idOrBusinessId: string
): Promise<Result> {
  try {
    await requireSuperAdmin();
    const admin = supabaseAdmin();

    const { businessId } = await resolveListingAndBusinessId(admin, idOrBusinessId);

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
    revalidatePath(dashboardPath(lang));
    return ok({});
  } catch (e) {
    return fail(e);
  }
}