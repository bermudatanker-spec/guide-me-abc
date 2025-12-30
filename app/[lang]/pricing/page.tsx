import type { Locale } from "@/i18n/config";
import PricingClient from "./PricingClient";
import { supabaseServer } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ lang: Locale }>;
};

export default async function PricingPage({ params }: PageProps) {
  const { lang } = await params;

  const sb = await supabaseServer();
  const { data, error } = await sb.auth.getUser();
  const user = data?.user ?? null;

  // als niet ingelogd: je kan hier ook "public pricing" tonen,
  // maar voor betalen moet je ingelogd zijn
  if (error || !user) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Pricing</h1>
        <p className="mt-2">Log in om een pakket te kiezen.</p>
      </div>
    );
  }

  // ✅ businessId ophalen (kies 1 van deze 2 — wat bij jou klopt)

  // OPTIE A: via businesses.owner_id
  const { data: biz } = await sb
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // OPTIE B (als je die hebt): via business_listings.owner_id
  // const { data: biz } = await sb
  //   .from("business_listings")
  //   .select("business_id")
  //   .eq("owner_id", user.id)
  //   .order("created_at", { ascending: false })
  //   .limit(1)
  //   .maybeSingle();

  const businessId = (biz as any)?.id ?? (biz as any)?.business_id;
  if (!businessId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Pricing</h1>
        <p className="mt-2">Geen business gevonden voor dit account.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Pricing</h1>
      <p className="mt-2 mb-4">Kies je pakket.</p>
      <PricingClient lang={lang} businessId={businessId} />
    </div>
  );
}