"use server";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { generateUniqueBusinessSlug } from "@/lib/business/slug-unique";
import { langHref } from "@/lib/lang-href";
import type { Locale } from "@/i18n/config";

type State = { error?: string };

function s(v: FormDataEntryValue | null) {
  return String(v ?? "").trim();
}
function toNull(v: string) {
  const t = v.trim();
  return t.length ? t : null;
}
function normIsland(v: string) {
  const x = v.toLowerCase().trim();
  return x === "aruba" || x === "bonaire" || x === "curacao" ? x : null;
}
function truthy(v: string) {
  const x = v.toLowerCase();
  return v === "1" || x === "true" || x === "on";
}

export async function createBusinessWithListingAction(
  lang: Locale,
  _prev: State,
  formData: FormData
): Promise<State> {
  const name = s(formData.get("name"));
  const island = normIsland(s(formData.get("island")));
  const categoryId = s(formData.get("category_id"));

  if (name.length < 2) return { error: "Bedrijfsnaam is te kort." };
  if (!island) return { error: "Kies een geldig eiland." };
  if (!categoryId) return { error: "Kies een categorie." };

  const description = toNull(s(formData.get("description")));
  const address = toNull(s(formData.get("address")));
  const phone = toNull(s(formData.get("phone")));
  const whatsapp = toNull(s(formData.get("whatsapp")));
  const email = toNull(s(formData.get("email")));
  const website = toNull(s(formData.get("website")));
  const openingHours = toNull(s(formData.get("opening_hours")));
  const temporarilyClosed = truthy(s(formData.get("temporarily_closed")));

  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;

  if (!user) return { error: "Je bent niet ingelogd." };

  // 1 business per user (zoals je al had)
  const { data: existing } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing?.id) redirect(langHref(lang, "/business/dashboard"));

  const slug = await generateUniqueBusinessSlug(name);

  // A) businesses (source of truth)
  const { data: biz, error: bizErr } = await supabase
    .from("businesses")
    .insert({
      user_id: user.id,
      name,
      slug,
      island,
      description,
      phone,
      whatsapp,
      email,
      website,
      plan: "start", // ✅ BELANGRIJK: zet dit naar jouw DB enum (was eerder "start")
    })
    .select("id")
    .single();

  if (bizErr || !biz?.id) {
    return { error: bizErr?.message ?? "Kon bedrijf niet aanmaken." };
  }

  // B) business_listings (category_id verplicht)
  const { error: listErr } = await supabase.from("business_listings").insert({
    business_id: biz.id,
    category_id: categoryId,
    business_name: name,
    island,
    status: "pending",
    subscription_plan: "starter",
    description,
    address,
    phone,
    whatsapp,
    email,
    website,
    opening_hours: openingHours,
    temporarily_closed: temporarilyClosed,
  });

  if (listErr) {
    await supabase.from("businesses").delete().eq("id", biz.id);
    return { error: listErr.message };
  }

  redirect(langHref(lang, "/business/dashboard"));
}