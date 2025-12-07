import { supabaseServer } from "@/lib/supabase/server";

type RawRow = { key: string; value: any };

export async function getPlatformSettings() {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("platform_settings")
    .select("key, value");   // <--- Geen generics meer

  if (error || !data) {
    console.error("[platform-settings] load error", error);
    return null;
  }

  const map = new Map<string, any>();
  for (const row of data as RawRow[]) {
    map.set(row.key, row.value);
  }

  const maintenance = map.get("maintenance_mode");

  const maintenance_mode =
    maintenance === true ||
    maintenance === "true" ||
    maintenance === 1 ||
    maintenance === "1";

  return { maintenance_mode };
}