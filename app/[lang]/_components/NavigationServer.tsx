// src/app/[lang]/_components/NavigationServer.tsx
import Navigation from "@/components/Navigation";
import type { Locale } from "@/i18n/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Props = {
  lang: Locale;
};

export default async function NavigationServer({ lang }: Props) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const isLoggedIn = !!data.user;

  return <Navigation lang={lang} isLoggedIn={isLoggedIn} />;
}