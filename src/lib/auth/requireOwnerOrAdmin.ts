import { redirect } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { langHref } from "@/lib/lang-href";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getRoleFlags } from "@/lib/auth/get-role-flags";

/**
 * @param lang Locale
 * @param listingId business_listings.id (dus listing id)
 */
export async function requireOwnerOrAdmin(lang: Locale, listingId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("[requireOwnerOrAdmin] auth error", error);
    redirect(langHref(lang, "/business/auth"));
  }

  if (!data?.user) {
    redirect(langHref(lang, "/business/auth"));
  }

  const user = data.user;
  const flags = getRoleFlags(user);

  // ✅ admin/super always ok
  if (flags.isAdmin || flags.isSuperAdmin) return user;

  // ✅ owner check (via listing.owner_id)
  const { data: row, error: qErr } = await supabase
    .from("business_listings")
    .select("owner_id")
    .eq("id", listingId)
    .maybeSingle();

  if (qErr) {
    console.error("[requireOwnerOrAdmin] query error", qErr);
    redirect(langHref(lang, "/business/dashboard"));
  }

  if (!row?.owner_id || row.owner_id !== user.id) {
    redirect(langHref(lang, "/business/dashboard"));
  }

  return user;
}