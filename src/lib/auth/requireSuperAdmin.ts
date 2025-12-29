// src/lib/auth/requireSuperAdmin.ts
import { redirect } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { supabaseServer } from "@/lib/supabase/server";
import { langHref } from "@/lib/lang-href";
import { getRoleFlags } from "@/lib/auth/get-role-flags";

export async function requireSuperAdmin(lang: Locale) {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("[requireSuperAdmin] auth error", error);
  }

  const { isSuperAdmin } = getRoleFlags(data.user)

  if (!isSuperAdmin) {
    redirect(langHref(lang, "/business/dashboard"));
  }

  return data.user;
}