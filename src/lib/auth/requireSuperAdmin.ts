// src/lib/auth/requireSuperAdmin.ts
import { redirect } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { supabaseServer } from "@/lib/supabase/server";
import { langHref } from "@/lib/lang-href";
import { isSuperAdminUser } from "./roles";

export async function requireSuperAdmin(lang: Locale) {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("[requireSuperAdmin] auth error", error);
  }

  const user = data?.user;
  if (!user) redirect(langHref(lang, "/business/auth"));

  if (!isSuperAdminUser(user)) {
    redirect(langHref(lang, "/business/dashboard"));
  }

  return { user };
}