// app/[lang]/layout.tsx
import type { ReactNode } from "react";

import ClientRoot from "../ClientRoot";
import { isLocale, type Locale } from "@/i18n/config";
import { supabaseServer } from "@/lib/supabase/server";
import { getPlatformSettings } from "@/lib/platform-settings";

// Aanrader als maintenance/user altijd up-to-date moet zijn:
export const dynamic = "force-dynamic";

function normalizeLang(raw: string): Locale {
  return isLocale(raw) ? (raw as Locale) : "en";
}

function normalizeRoles(input: unknown): string[] {
  if (Array.isArray(input)) return input.map((r) => String(r).toLowerCase());
  if (typeof input === "string") return [input.toLowerCase()];
  return [];
}

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang = normalizeLang(raw);

  // Settings + user parallel ophalen
  const [settings, user] = await Promise.all([
    getPlatformSettings(),
    (async () => {
      const supabase = await supabaseServer();
      const { data } = await supabase.auth.getUser();
      return data.user ?? null;
    })(),
  ]);

  const roles = normalizeRoles((user?.app_metadata as Record<string, unknown> | null)?.roles);
  const isSuperAdmin = roles.includes("super_admin") || roles.includes("superadmin");
  const maintenanceOn = Boolean(settings?.maintenance_mode);

  if (maintenanceOn && !isSuperAdmin) {
    const isNl = lang === "nl";

    return (
      <main className="min-h-dvh flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold">
            {isNl ? "Tijdelijk niet beschikbaar" : "Temporarily unavailable"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isNl
              ? "Guide Me ABC is tijdelijk in onderhoud. Probeer het later opnieuw."
              : "Guide Me ABC is currently under maintenance. Please try again later."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <ClientRoot lang={lang}>
      {/* BELANGRIJK: geen <main> wrapper hier om nested-main/layout issues te voorkomen */}
      <div id="page-content" className="min-h-dvh pt-16">
        {children}
      </div>
    </ClientRoot>
  );
}
