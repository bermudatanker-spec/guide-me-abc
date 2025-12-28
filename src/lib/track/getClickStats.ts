import { supabaseServer } from "@/lib/supabase/server";

export type ClickType = "whatsapp" | "route" | "call" | "website";

export async function getClickStats(businessId: string, days: number) {
  const supabase = await supabaseServer();

  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from("business_click_events")
    .select("event_type")
    .eq("business_id", businessId)
    .gte("created_at", since.toISOString());

  if (error) throw error;

  const base = { whatsapp: 0, route: 0, call: 0, website: 0 } as Record<ClickType, number>;
  for (const row of data ?? []) {
    const t = row.event_type as ClickType;
    if (t in base) base[t] += 1;
  }
  return base;
}