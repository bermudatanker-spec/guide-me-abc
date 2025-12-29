"use server";

import "server-only";

import type { Locale } from "@/i18n/config";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Ok<T = {}> = { ok: true } & T;
type Fail = { ok: false; error: string };
export type Result<T = {}> = Ok<T> | Fail;

function ok<T>(data?: T): Ok<T> {
  return { ok: true, ...(data ?? ({} as T)) };
}
function fail(error: unknown): Fail {
  return { ok: false, error: error instanceof Error ? error.message : String(error) };
}

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

/** ---- types shared with client ---- */
export type SettingKey =
  | "maintenance_mode"
  | "allow_registrations"
  | "auto_approve_businesses"
  | "auto_approve_reviews"
  | "force_email_verification"
  | "ai_max_free"
  | "ai_max_premium"
  | "ai_temperature"
  | "featured_per_island"
  | "auto_sort_popular"
  | "auto_block_suspicious"
  | "rate_limit_level";

export type SettingsPayload = Record<SettingKey, boolean | number>;

type Row = { key: string; value: unknown };

/** ✅ READ via service role (consistent, onafhankelijk van RLS) */
export async function godmodeLoadSettingsAction(_lang: Locale): Promise<Result<{ rows: Row[] }>> {
  try {
    const sb = await supabaseServer();
    const { data, error } = await sb.auth.getUser();
    if (error) return fail(error.message);
    if (!data?.user) return fail("Niet ingelogd.");
    if (!isSuperAdmin(data.user)) return fail("Geen toegang (super_admin vereist).");

    const admin = supabaseAdmin();
    const { data: rows, error: qErr } = await admin
      .from("platform_settings")
      .select("key, value")
      .order("key", { ascending: true });

    if (qErr) return fail(qErr.message);
    return ok({ rows: (rows ?? []) as Row[] });
  } catch (e) {
    return fail(e);
  }
}

/** ✅ SAVE via service role (super_admin only) */
export async function godmodeSaveSettingsAction(
  _lang: Locale,
  payload: SettingsPayload
): Promise<Result> {
  try {
    const sb = await supabaseServer();
    const { data, error } = await sb.auth.getUser();
    if (error) return fail(error.message);
    if (!data?.user) return fail("Niet ingelogd.");
    if (!isSuperAdmin(data.user)) return fail("Geen toegang (super_admin vereist).");

    const rows = Object.entries(payload).map(([key, value]) => ({ key, value }));
    const admin = supabaseAdmin();

    const { error: upErr } = await admin
      .from("platform_settings")
      .upsert(rows, { onConflict: "key" });

    if (upErr) return fail(upErr.message);

    return ok({});
  } catch (e) {
    return fail(e);
  }
}