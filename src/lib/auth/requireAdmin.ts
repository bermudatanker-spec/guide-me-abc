import { redirect } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { langHref } from "@/lib/lang-href";
import { getRoleFlags } from "@/lib/auth/get-role-flags";

export async function requireAdmin(lang: Locale) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("[requireAdmin] auth error", error);
    redirect(langHref(lang, "/business/auth"));
  }

  if (!data?.user) {
    redirect(langHref(lang, "/business/auth"));
  }

  const { isAdmin, isSuperAdmin } = getRoleFlags(data.user);

  if (!isAdmin && !isSuperAdmin) {
    redirect(langHref(lang, "/business/dashboard"));
  }

  return data.user;
}