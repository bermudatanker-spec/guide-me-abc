// app/[lang]/businesses/_lib/query.ts
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Island, Plan } from "./constants";

export type BusinessRow = {
  id: string;
  business_id: string;
  business_name: string;
  description: string | null;
  island: Island;
  categories: { name: string; slug: string } | null;
  logo_url: string | null;
  cover_image_url: string | null;
  subscription_plan: Plan | null;
  subscription_status: "active" | "inactive" | null;
  status: "pending" | "active" | "inactive" | null; // listing status
};

export async function fetchBusinesses(islandFilter: Island | null) {
  const s = await createSupabaseServerClient();

  let query = s
    .from("business_listings_with_subscription") // ✅ VIEW i.p.v. business_listings
    .select(
      `
        id,
        business_id,
        business_name,
        description,
        island,
        categories:category_id ( name, slug ),
        logo_url,
        cover_image_url,
        subscription_plan,
        subscription_status,
        status
      `
    )
    .eq("status", "active"); // ✅ listings actief tonen (zoals je nu al doet)

  if (islandFilter) query = query.eq("island", islandFilter);

  const { data, error } = await query.returns<BusinessRow[]>();
  return { data: data ?? [], error };
}