// app/[lang]/account/page.tsx
import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PageParams = { lang: Locale };
type PageProps = { params: Promise<PageParams> };

type Role = "client" | "admin" | "godmode";

function normalizeRole(x: unknown): Role {
  const v = String(x ?? "").toLowerCase().trim();
  if (v === "godmode" || v === "superadmin") return "godmode";
  if (v === "admin" || v === "super_admin" || v === "superadmin") return "admin";
  return "client";
}

export default async function AccountEntry({ params }: PageProps) {
  const { lang: raw } = await params;
  const lang = isLocale(raw) ? raw : "en";

  const supabase = await createSupabaseServerClient();

  // 1) user
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    // niet ingelogd → naar login (jouw route)
    redirect(`/${lang}/business/auth?redirectedFrom=/${lang}/account`);
  }

  // 2) role(s) ophalen: eerst app_metadata, fallback profiles
  const metaRole = (user.app_metadata as any)?.role ?? (user.app_metadata as any)?.roles?.[0];
  let role = normalizeRole(metaRole);

  // fallback naar profiles (als je roles daar bewaart)
  if (!metaRole) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, roles, is_godmode, is_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) {
      // kies wat jij gebruikt:
      // - role: string
      // - roles: string[]
      // - is_godmode / is_admin: boolean flags
      const r =
        (profile as any).role ??
        ((profile as any).roles?.[0] ?? null);

      role = normalizeRole(r);

      if ((profile as any).is_godmode) role = "godmode";
      else if ((profile as any).is_admin && role === "client") role = "admin";
    }
  }

  // 3) redirect naar juiste dashboard
  if (role === "godmode") redirect(`/${lang}/admin/businesses`);
  if (role === "admin") redirect(`/${lang}/admin/businesses`);

  // client
  redirect(`/${lang}/business/dashboard`);
}