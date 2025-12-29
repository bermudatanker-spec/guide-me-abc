import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { supabaseServer } from "@/lib/supabase/server";

function isSuperAdmin(user: any) {
  const role =
    ((user?.app_metadata as any)?.role ??
      (user as any)?.role ??
      (user?.app_metadata as any)?.roles ??
      "") as any;

  const roles = Array.isArray(role) ? role : [role];
  return roles
    .map((r) => String(r).toLowerCase().trim())
    .some((r) => r === "super_admin" || r === "superadmin");
}

export default async function GodmodeLayout({ children }: { children: ReactNode }) {
  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  const user = data?.user;

  if (!user || !isSuperAdmin(user)) {
    redirect("/"); // of `/${lang}/business/dashboard` als je lang wilt gebruiken
  }

  return <>{children}</>;
}