"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { langHref } from "@/lib/lang-href";

type State = { error?: string };

export async function updateBusinessAction(
  langRaw: string,
  businessId: string,
  _prev: State,
  formData: FormData,
) {
  const lang: Locale = isLocale(langRaw) ? (langRaw as Locale) : "en";

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;

  const phone = String(formData.get("phone") ?? "").trim() || null;
  const whatsapp = String(formData.get("whatsapp") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const website = String(formData.get("website") ?? "").trim() || null;

  const islandRaw = String(formData.get("island") ?? "").toLowerCase().trim();
  const island =
    islandRaw === "aruba" || islandRaw === "bonaire" || islandRaw === "curacao"
      ? islandRaw
      : null;

  if (name.length < 2) return { error: "Bedrijfsnaam is te kort." };

  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) return { error: "Niet ingelogd." };

  // owner-check via RLS + expliciet
  const { data: existing } = await supabase
    .from("businesses")
    .select("id,user_id")
    .eq("id", businessId)
    .maybeSingle();

  if (!existing || existing.user_id !== auth.user.id) {
    return { error: "Geen toegang tot dit bedrijf." };
  }

  const { error } = await supabase
    .from("businesses")
    .update({
      name,
      description,
      island,
      phone,
      whatsapp,
      email,
      website,
    })
    .eq("id", businessId);

  if (error) return { error: error.message };

  redirect(langHref(lang, "/business/dashboard"));
}