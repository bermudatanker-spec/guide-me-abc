// app/[lang]/business/mini/page.tsx
import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";

import MiniSiteActions from "@/components/business/MiniSiteActions";
import { supabaseServer } from "@/lib/supabase/server";
import { isLocale, type Locale } from "@/i18n/config";
import { langHref } from "@/lib/lang-href";

import MiniSiteSettingsClient from "./MiniSiteSettingsClient";
import type { ListingRow } from "@/types/listing";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  // ✅ Next 16: params is Promise
  params: Promise<{ lang: string }>;
};

export const metadata: Metadata = {
  title: "Mini-site instellingen – Guide Me ABC",
  description: "Beheer de highlights en socials van je mini-site op Guide Me ABC.",
};

function getRoles(user: { app_metadata?: unknown } | null): string[] {
  const raw = (user?.app_metadata as any)?.roles;

  if (Array.isArray(raw)) return raw.map((r) => String(r).toLowerCase());
  if (typeof raw === "string") return [raw.toLowerCase()];
  return [];
}

export default async function MiniSiteSettingsPage({ params }: PageProps) {
  const { lang: rawLang } = await params;
  const lang: Locale = isLocale(rawLang) ? (rawLang as Locale) : "en";

  const supabase = await supabaseServer();

  // 1) User ophalen
  const { data, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.error("[mini-site/settings] auth error", userError);
    redirect(langHref(lang, "/business/auth"));
  }

  const user = data.user;
  if (!user) {
    redirect(langHref(lang, "/business/auth"));
  }

  // 2) PRO + ACTIVE listing ophalen voor deze owner
  const { data: listing, error } = await supabase
    .from("business_listings")
    .select(
      `
        id,
        phone,
        whatsapp,
        email,
        route_url,
        owner_id,
        subscription_plan,
        status,
        is_verified,
        verified_at,
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
    .maybeSingle<ListingRow>();

  if (error) {
    console.error("[mini-site/settings] load error", error);
    notFound();
  }

  if (!listing) {
    redirect(langHref(lang, "/business/dashboard?mini=locked"));
  }

  // 3) Owner / super_admin check
  const roles = getRoles(user);
  const isSuperAdmin = roles.includes("super_admin") || roles.includes("superadmin");
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
    <>
      <MiniSiteSettingsClient
        lang={lang}
        listingId={listing.id}
        initialHighlights={initialHighlights}
        initialSocials={initialSocials}
      />

      <MiniSiteActions
        lang={lang}
        businessId={listing.id}
        phone={listing.phone ?? ""}
        whatsapp={listing.whatsapp ?? ""}
        email={listing.email ?? ""}
        routeUrl={listing.route_url ?? ""}
      />
    </>
  );
}