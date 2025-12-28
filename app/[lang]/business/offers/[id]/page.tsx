// app/[lang]/business/offers/[id]/page.tsx
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { isLocale, type Locale } from "@/i18n/config";
import { translations } from "@/i18n/translations";
import OffersClient from "./ui/OffersClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{ lang: string; id: string }>;
};

export default async function BusinessOffersPage({ params }: PageProps) {
  const { lang: rawLang, id } = await params;
  const lang: Locale = isLocale(rawLang) ? rawLang : "en";
  const t = translations[lang];

  const supabase = await supabaseServer();

  const { data: biz, error } = await supabase
    .from("business_listings")
    .select("id, business_name")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows (kan verschillen per setup), dus “hard errors” vangen we af
    console.error("[offers page] business_listings error:", error);
  }

  // Als je liever 404 wilt i.p.v. "Onbekend bedrijf", gebruik dit:
  if (!biz) notFound();

  return (
    <OffersClient
      lang={lang}
      businessId={id}
      businessName={biz.business_name}
      t={t}
    />
  );
}
