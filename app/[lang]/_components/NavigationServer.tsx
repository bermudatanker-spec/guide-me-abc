// src/app/[lang]/_components/NavigationServer.tsx
import Navigation from "@/components/Navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function NavigationServer({ lang }: { lang: string }) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) console.warn("[NavigationServer] getUser error:", error.message);

  return <Navigation lang={lang} isLoggedIn={!!data?.user} />;
}