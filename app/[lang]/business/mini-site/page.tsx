// app/[lang]/business/mini/page.tsx
import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";

import { supabaseServer } from "@/lib/supabase/server";
import { isLocale, type Locale } from "@/i18n/config";
import { langHref } from "@/lib/lang-href";
import MiniSiteSettingsClient from "./MiniSiteSettingsClient";

type PageProps = {
  // Next 15/16: params is een Promise
  params: Promise<{ lang: string }>;
};

export const metadata: Metadata = {
  title: "Mini-site instellingen – Guide Me ABC",
  description:
    "Beheer de highlights en socials van je mini-site op Guide Me ABC.",
};

export default async function MiniSiteSettingsPage({ params }: PageProps) {
  const { lang: rawLang } = await params;
  const lang: Locale = isLocale(rawLang) ? (rawLang as Locale) : "en";

  // 🔹 LET OP: GEEN await hier, supabaseServer() is sync
  const supabase = await supabaseServer();

  // 1) Ingelogde gebruiker ophalen
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("[mini-site/settings] auth error", userError);
  }

  if (!user) {
    redirect(langHref(lang, "/business/auth"));
  }

  // 2) De PRO + ACTIVE business_listing van deze owner zoeken
  //    (nu: één listing per owner – eerste match wordt gebruikt)
  const { data: listing, error } = await supabase
    .from("business_listings")
    .select(
      `
      id,
      owner_id,
      subscription_plan,
      status,
      highlight_1,
      highlight_2,
      highlight_3,
      social_instagram,
      social_facebook,
      social_tiktok
    `
    )
    .eq("owner_id", user.id)
    .eq("subscription_plan", "pro")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .maybeSingle<{
      id: string;
      owner_id: string;
      subscription_plan: string | null;
      status: string | null;
      highlight_1: string | null;
      highlight_2: string | null;
      highlight_3: string | null;
      social_instagram: string | null;
      social_facebook: string | null;
      social_tiktok: string | null;
    }>();

  if (error) {
    console.error("[mini-site/settings] load error", error);
    notFound();
  }
  if (!listing) {
    // Geen PRO + ACTIVE listing gevonden → terug naar dashboard
    redirect(langHref(lang, "/business/dashboard?mini=locked"));
  }

  // Owner / super_admin check – in deze variant nog steeds gewoon aanwezig
  const rawRoles = (user.app_metadata as any)?.roles;
  const rolesArr = Array.isArray(rawRoles)
    ? rawRoles.map((r: any) => String(r).toLowerCase())
    : [];
  const isSuperAdmin =
    rolesArr.includes("super_admin") || rolesArr.includes("superadmin");
  const isOwner = listing.owner_id === user.id;

  if (!isOwner && !isSuperAdmin) {
    redirect(langHref(lang, "/business/dashboard"));
  }

  const initialHighlights = [
    listing.highlight_1 ?? "",
    listing.highlight_2 ?? "",
    listing.highlight_3 ?? "",
  ];

  const initialSocials = {
    instagram: listing.social_instagram ?? "",
    facebook: listing.social_facebook ?? "",
    tiktok: listing.social_tiktok ?? "",
  };

  return (
    <MiniSiteSettingsClient
      lang={lang}
      listingId={listing.id}
      initialHighlights={initialHighlights}
      initialSocials={initialSocials}
    />
  );
}