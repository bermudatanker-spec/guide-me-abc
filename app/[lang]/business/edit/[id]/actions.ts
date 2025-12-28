"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { supabaseServer } from "@/lib/supabase/server";
import { isLocale, type Locale } from "@/i18n/config";
import { langHref } from "@/lib/lang-href";

type State = { error?: string };

// Helpers
function normalizePhone(v: string) {
  // hou het simpel: laat alleen + en digits over
  return v.replace(/[^\d+]/g, "").trim();
}

function normalizeWebsite(v: string) {
  const s = v.trim();
  if (!s) return null;

  // accepteer "example.com" en maak er "https://example.com" van
  if (!/^https?:\/\//i.test(s)) return `https://${s}`;
  return s;
}

const schema = z.object({
  name: z.string().trim().min(2, "Bedrijfsnaam is te kort.").max(80, "Bedrijfsnaam is te lang."),
  description: z.string().trim().max(2000, "Beschrijving is te lang.").optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(40).optional().or(z.literal("")),
  email: z.string().trim().email("Ongeldig e-mailadres.").max(255).optional().or(z.literal("")),
  website: z.string().trim().max(400).optional().or(z.literal("")),
  island: z
    .string()
    .trim()
    .toLowerCase()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => v === "" || v === "aruba" || v === "bonaire" || v === "curacao",
      "Ongeldig eiland."
    ),
});

export async function updateBusinessAction(
  langRaw: string,
  businessId: string,
  _prev: State,
  formData: FormData
): Promise<State> {
  const lang: Locale = isLocale(langRaw) ? (langRaw as Locale) : "en";

  // 1) FormData -> plain object
  const raw = {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    email: String(formData.get("email") ?? ""),
    website: String(formData.get("website") ?? ""),
    island: String(formData.get("island") ?? ""),
  };

  // 2) Validate
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer je invoer." };
  }

  // 3) Normalize
  const name = parsed.data.name;
  const description = parsed.data.description?.trim() ? parsed.data.description.trim() : null;

  const phone = parsed.data.phone?.trim() ? normalizePhone(parsed.data.phone) : null;
  const whatsapp = parsed.data.whatsapp?.trim() ? normalizePhone(parsed.data.whatsapp) : null;

  const email = parsed.data.email?.trim() ? parsed.data.email.trim().toLowerCase() : null;
  const website = parsed.data.website?.trim() ? normalizeWebsite(parsed.data.website) : null;

  const islandRaw = parsed.data.island?.toLowerCase().trim();

const island =
  islandRaw === "aruba" ||
  islandRaw === "bonaire" ||
  islandRaw === "curacao"
    ? islandRaw
    : null;

  // 4) Auth
  const supabase = await supabaseServer();
  const { data: auth, error: authError } = await supabase.auth.getUser();

  if (authError) return { error: authError.message };
  if (!auth.user) return { error: "Niet ingelogd." };

  // 5) Owner check (extra veiligheid bovenop RLS)
  // ⚠️ Zorg dat dit matcht met je echte tabelnaam:
  // - als jouw tabel business_listings heet: laat zo
  // - als jouw tabel businesses heet: vervang "business_listings" -> "businesses"
  const { data: existing, error: existingError } = await supabase
    .from("business_listings")
    .select("id, owner_id")
    .eq("id", businessId)
    .maybeSingle<{ id: string; owner_id: string }>();

  if (existingError) return { error: existingError.message };
  if (!existing) {
  return { error: "Bedrijf niet gevonden." };
}

if (existing.owner_id !== auth.user.id) {
  return { error: "Geen toegang tot dit bedrijf." };
}

  // 6) Update
  const { error } = await supabase
    .from("business_listings")
    .update({
      business_name: name, // ⚠️ dit veld heet bij jou vaak business_name
      description,
      island,
      phone,
      whatsapp,
      email,
      website,
    })
    .eq("id", businessId);

  if (error) return { error: error.message };

  // 7) Success -> redirect
  redirect(langHref(lang, "/business/dashboard"));
}