// app/[lang]/business/edit/[id]/page.tsx
import { redirect } from "next/navigation";

import { isLocale, type Locale } from "@/i18n/config";
import { supabaseServer } from "@/lib/supabase/server";
import { langHref } from "@/lib/lang-href";

import EditBusinessForm from "./ui/EditBusinessForm";

type Params = { lang: string; id: string };
type PageProps = { params: Promise<Params> };

export const dynamic = "force-dynamic";

export default async function EditBusinessPage({ params }: PageProps) {
  const { lang: rawLang, id } = await params;
  const lang: Locale = isLocale(rawLang) ? (rawLang as Locale) : "en";

  const supabase = await supabaseServer();

  // 1) Auth guard
  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr) {
    redirect(langHref(lang, "/business/auth"));
  }
  if (!auth?.user) {
    redirect(langHref(lang, "/business/auth"));
  }

  // 2) Load business by businesses.id (dit is exact wat DashboardHome nu linkt)
  const { data: business, error } = await supabase
    .from("businesses")
    .select("id, user_id, name, slug, description, island, phone, whatsapp, email, website")
    .eq("id", id)
    .maybeSingle();

  // 3) Ownership guard (futureproof: owner_id OF user_id)
type BusinessRow = {
  id: string;
  user_id: string;
  name: string | null;
  slug: string | null;
  description: string | null;
  island: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
};

// business kan null zijn
const b = business as BusinessRow | null;

const isOwner = !!b && b.user_id === auth.user.id;

  // Niet gevonden of niet van jou -> terug naar dashboard (geen loop)
  if (error || !b || !isOwner) {
    redirect(langHref(lang, "/business/dashboard"));
  }

  // 4) Render form
  return <EditBusinessForm lang={lang} business={business as any} />;
}