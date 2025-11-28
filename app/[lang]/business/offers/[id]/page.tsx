// app/[lang]/business/offers/[id]/page.tsx

import { supabaseServer } from "@/lib/supabase/server";
import { isLocale, type Locale } from "@/i18n/config";
import { translations } from "@/i18n/translations";
import OffersClient from "./ui/OffersClient";

type PageProps = {
  // idem als bij biz/[id] – params is een Promise in Next 16
  params: Promise<{ lang: string; id: string }>;
};

export default async function BusinessOffersPage({ params }: PageProps) {
  const { lang: rawLang, id } = await params;
  const lang: Locale = isLocale(rawLang) ? rawLang : "en";

  const t = translations[lang];

  // ⬇️ LET OP: nu async
  const supabase = await supabaseServer();

  // Haal bedrijfsnaam op voor header
  const { data: biz } = await supabase
    .from("business_listings")
    .select("id, business_name")
    .eq("id", id)
    .single();

  // als bedrijf niet bestaat, tonen we gewoon 'Onbekend bedrijf'
  const businessName = biz?.business_name ?? "Onbekend bedrijf";

  return (
    <OffersClient
      lang={lang}
      businessId={id}
      businessName={businessName}
      t={t}
    />
  );
}