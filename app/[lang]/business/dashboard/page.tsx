// app/[lang]/business/dashboard/page.tsx
import { redirect } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { isLocale } from "@/i18n/config";
import { DICTS } from "@/i18n/dictionaries";

import { langHref } from "@/lib/lang-href";
import { supabaseServer } from "@/lib/supabase/server";

import DashboardClient from "./ui/DashboardClient";

export const dynamic = "force-dynamic";

// In Next 15/16 is params een Promise
type Params = { lang: string };

type PageProps = {
  params: Promise<Params>;
};

export default async function DashboardPage({ params }: PageProps) {
  const { lang: rawLang } = await params;
  const lang: Locale = isLocale(rawLang) ? (rawLang as Locale) : "en";

  // ---- SERVER-SIDE AUTH GUARD ----
  const supabase = await (supabaseServer as any)();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // niet ingelogd -> stuur naar business/auth
    redirect(langHref(lang, "/business/auth"));
  }

  // vertalingen voor de client
  const t = DICTS[lang];

  // UI + verdere data-handling doen we in de client component
  return <DashboardClient lang={lang} t={t} />;
}