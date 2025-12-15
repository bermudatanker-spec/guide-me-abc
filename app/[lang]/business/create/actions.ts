"use server";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { generateUniqueBusinessSlug } from "@/lib/business/slug-unique";
import { isLocale, type Locale } from "@/i18n/config";
import { langHref } from "@/lib/lang-href";

type CreateState = { error?: string };

function normIsland(v: FormDataEntryValue | null) {
  const s = String(v ?? "").toLowerCase().trim();
  if (s === "aruba" || s === "bonaire" || s === "curacao") return s;
  return null;
}

function normId(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

export async function createBusinessAction(
  langRaw: string,
  _prev: CreateState,
  formData: FormData
): Promise<CreateState> {
  const lang: Locale = isLocale(langRaw) ? (langRaw as Locale) : "en";

  const name = String(formData.get("name") ?? "").trim();
  const island = normIsland(formData.get("island"));
  const categoryId = normId(formData.get("category_id"));

  if (name.length < 2) return { error: "Bedrijfsnaam is te kort." };
  if (!island) return { error: "Kies een eiland." };
  if (!categoryId) return { error: "Kies een categorie." };

  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;

  if (!user) return { error: "Je bent niet ingelogd." };

  // 1) 1 business per user (voor nu)
  const { data: existing, error: exErr } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (exErr) return { error: exErr.message };

  if (existing?.id) {
    redirect(langHref(lang, "/business/dashboard"));
  }

  // 2) business aanmaken
  const slug = await generateUniqueBusinessSlug(name);

  const { data: b, error: bErr } = await supabase
    .from("businesses")
    .insert({
      user_id: user.id,
      name,
      slug,
      island,
      plan: "starter", // consistent met subscription_plan
    })
    .select("id")
    .single();

  if (bErr || !b?.id) {
    return { error: bErr?.message ?? "Kon bedrijf niet aanmaken." };
  }

  // 3) listing aanmaken (category_id is verplicht)
  const { error: lErr } = await supabase.from("business_listings").insert({
    business_id: b.id,
    owner_id: user.id, // bestaat bij jou (DashboardClient gebruikt owner_id)
    business_name: name,
    island,
    category_id: categoryId,
    status: "pending",
    subscription_plan: "starter",
  });

  if (lErr) {
    // als listing faalt, is business al gemaakt -> liever duidelijke fout
    return {
      error:
        "Bedrijf is gemaakt, maar listing kon niet worden aangemaakt: " +
        lErr.message,
    };
  }

  redirect(langHref(lang, "/business/dashboard"));
}