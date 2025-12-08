// src/lib/platform-settings.ts
import { supabaseServer } from "@/lib/supabase/server";

type RawRow = {
  key: string;
  value: any;
};

/**
 * Haalt globale platform instellingen op (godmode toggles, maintenance, etc.)
 * Geeft null terug als er iets misgaat.
 */
export async function getPlatformSettings() {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("platform_settings")
    .select("key, value"); // <-- geen <RawRow[]> hier

  if (error || !data) {
    console.error("[platform-settings] load error", error);
    return null;
  }

  const rows = data as RawRow[]; // veilig casten

  const map = new Map<string, any>();
  for (const row of rows) {
    map.set(row.key, row.value);
  }

  const maintenance = map.get("maintenance_mode");

  const maintenance_mode =
    maintenance === true ||
    maintenance === "true" ||
    maintenance === 1 ||
    maintenance === "1";

  return {
    maintenance_mode,
  };
}