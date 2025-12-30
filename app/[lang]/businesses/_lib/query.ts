import { supabaseServer } from "@/lib/supabase/server";
import type { Island, Plan } from "./constants";

export type BusinessRow = {
  id: string;
  business_name: string;
  description: string | null;
  island: Island;
  categories: { name: string; slug: string } | null;
  logo_url: string | null;
  cover_image_url: string | null;
  subscription_plan: Plan | null;
  status: "pending" | "active" | "inactive" | null;
};

export async function fetchBusinesses(islandFilter: Island | null) {
  const s = await supabaseServer();

  let query = s
    .from("business_listings")
    .select(
      `
        id,
        business_name,
        description,
        island,
        categories:category_id ( name, slug ),
        logo_url,
        cover_image_url,
        subscription_plan,
        status
      `
    )
    .eq("status", "active");

  if (islandFilter) query = query.eq("island", islandFilter);

  const { data, error } = await query.returns<BusinessRow[]>();
  return { data: data ?? [], error };
}