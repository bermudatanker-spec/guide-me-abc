// app/[lang]/godmode/layout.tsx
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import BackButton from "@/components/BackButton";
import { supabaseServer } from "@/lib/supabase/server";
import { getRoleFlags } from "@/lib/auth/get-role-flags";

export default async function GodmodeLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { lang: string };
}) {
  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  const user = data?.user ?? null;

  const { isSuperAdmin } = getRoleFlags(user as any);

  // ✅ niet super_admin -> terug naar home (met juiste taal)
  if (!user || !isSuperAdmin) {
    redirect(`/${params.lang}`);
  }

  // ✅ UI wrapper + back button
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
      <div className="mb-4">
        <BackButton label="Terug" />
      </div>

      {children}
    </div>
  );
}