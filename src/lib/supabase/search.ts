import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export type SearchHit = {
  id: string;
  type: "business" | "page";
  title: string;
  slug: string | null;
  island_id: string | null;
  description: string | null;
};

type SB = SupabaseClient<Database>;

export async function searchAll(
  supabase: SB,
  q: string,
  opts?: { islandId?: string; limit?: number },
): Promise<SearchHit[]> {
  const query = q.trim();
  if (query.length < 2) return [];

  const limit = opts?.limit ?? 12;
  const islandId =
    opts?.islandId && opts.islandId !== "all" ? opts.islandId : null;

  // business_listings
  let b = supabase
    .from("business_listings")
    .select("id,name,slug,island_id,description")
    .order("created_at", { ascending: false })
    .limit(limit);

  // ✅ Correcte OR syntax (geen quotes nodig)
  b = b.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
  if (islandId) b = b.eq("island_id", islandId);

  const { data: businesses, error: bErr } = await b;
  if (bErr) throw bErr;

  const businessHits: SearchHit[] = (businesses ?? []).map((x) => ({
    id: x.id,
    type: "business",
    title: x.name ?? "—",
    slug: x.slug ?? null,
    island_id: x.island_id ?? null,
    description: x.description ?? null,
  }));

  // listing_pages
  let p = supabase
    .from("listing_pages")
    .select("id,title,slug,island_id,description")
    .order("created_at", { ascending: false })
    .limit(limit);

  p = p.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
  if (islandId) p = p.eq("island_id", islandId);

  const { data: pages, error: pErr } = await p;
  if (pErr) throw pErr;

  const pageHits: SearchHit[] = (pages ?? []).map((x) => ({
    id: x.id,
    type: "page",
    title: x.title ?? "—",
    slug: x.slug ?? null,
    island_id: x.island_id ?? null,
    description: x.description ?? null,
  }));

  // merge & unique
  const merged = [...businessHits, ...pageHits];
  const seen = new Set<string>();
  return merged
    .filter((h) => {
      const k = `${h.type}:${h.id}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, limit);
}