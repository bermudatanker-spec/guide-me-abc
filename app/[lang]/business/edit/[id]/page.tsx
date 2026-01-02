// app/[lang]/business/edit/[id]/page.tsx
import { redirect } from "next/navigation";

import { isLocale, type Locale } from "@/i18n/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { langHref } from "@/lib/lang-href";

import EditBusinessForm from "./ui/EditBusinessForm";

export const dynamic = "force-dynamic";

type Params = { lang: string; id: string };
type PageProps = { params: Promise<Params> };

type BusinessRow = {
  id: string;
  user_id: string;
  name: string | null;
  slug: string | null;
  description: string | null;
  island: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
};

export default async function EditBusinessPage({ params }: PageProps) {
  const { lang: rawLang, id } = await params;

  const lang: Locale = isLocale(rawLang) ? (rawLang as Locale) : "en";
  const supabase = await createSupabaseServerClient();

  // 1) Auth guard
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    redirect(langHref(lang, "/business/auth"));
  }

  // 2) Load business by businesses.id
  const { data: business, error } = await supabase
    .from("businesses")
    .select(
      "id, user_id, name, slug, description, island, phone, whatsapp, email, website"
    )
    .eq("id", id)
    .maybeSingle<BusinessRow>();

  // 3) Not found / ownership guard
  if (error || !business || business.user_id !== user.id) {
    // bewust redirect i.p.v. notFound om geen info te lekken
    redirect(langHref(lang, "/business/dashboard"));
  }

  // 4) Render form
  return <EditBusinessForm lang={lang} business={business} />;
}