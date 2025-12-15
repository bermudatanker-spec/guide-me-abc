// lib/auth/isSuperAdminServer.ts
import { supabaseServer } from "@/lib/supabase/server";

export async function isSuperAdminServer(): Promise<boolean> {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;
  if (!user) return false;

  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "super_admin")
    .maybeSingle();

  return !!roleRow;
}