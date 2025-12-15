import { supabaseServer } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";

export async function generateUniqueBusinessSlug(name: string) {
  const base = slugify(name) || "business";
  const supabase = await supabaseServer();

  // probeer base, base-2, base-3 ...
  for (let i = 0; i < 50; i++) {
    const slug = i === 0 ? base : `${base}-${i + 1}`;

    const { data, error } = await supabase
      .from("businesses")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (error) continue;
    if (!data) return slug;
  }

  // fallback (extreem zeldzaam)
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}