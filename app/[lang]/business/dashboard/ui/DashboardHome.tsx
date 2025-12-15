// app/[lang]/business/dashboard/ui/DashboardHome.tsx

import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { langHref } from "@/lib/lang-href";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Building2, Pencil, Globe, Lock, Sparkles, BarChart3 } from "lucide-react";

type Plan = "starter" | "growth" | "pro";
type Status = "pending" | "active" | "inactive";

type Caps = {
  maxCategories: number;
  maxLocations: number;
  maxDeals: number;
  maxPhotos: number;
  maxVideos: number;
};

type BusinessRow = {
  id: string;
  name: string | null;
  island: string | null;
  slug?: string | null;
  plan?: string | null;
};

type ListingRow = {
  id: string;
  status: string | null;
  subscription_plan: string | null;
  business_name: string | null;
  island: string | null;
};

type Props = {
  lang: Locale;
  business: BusinessRow;
  caps: Caps;
  listing?: ListingRow | null;
};

function normalizePlan(v: unknown): Plan {
  const p = String(v ?? "").trim().toLowerCase();
  if (p === "pro") return "pro";
  if (p === "growth") return "growth";
  if (p === "start") return "starter";
  return "starter";
}

function normalizeStatus(v: unknown): Status {
  const s = String(v ?? "").trim().toLowerCase();
  if (s === "active") return "active";
  if (s === "inactive") return "inactive";
  return "pending";
}

function islandLabel(v: string | null) {
  if (!v) return "—";
  if (v === "aruba") return "Aruba";
  if (v === "bonaire") return "Bonaire";
  if (v === "curacao") return "Curaçao";
  return v;
}

export default function DashboardHome({ lang, business, caps, listing }: Props) {
  const plan = normalizePlan(listing?.subscription_plan ?? business.plan);
  const status = normalizeStatus(listing?.status);

  const businessName =
    listing?.business_name?.trim() ||
    business?.name?.trim() ||
    "—";

  const island = islandLabel(listing?.island ?? business?.island);

  const showOpenMiniSite = status === "active" && !!listing?.id;
  const canUseMiniSiteSettings = plan === "pro" && !!listing?.id;

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold">Dashboard</h1>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{businessName}</span>
          <span>•</span>
          <span className="capitalize">{island}</span>

          <span className="ms-2" />

          <Badge variant={plan === "pro" ? "default" : "secondary"} className="capitalize">
            {plan}
          </Badge>
          <Badge variant={status === "active" ? "default" : "secondary"} className="capitalize">
            {status}
          </Badge>
        </div>

        {!listing?.id && (
          <div className="mt-4 rounded-md border border-amber-500/40 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Nog geen listing gevonden. Rond eerst je aanmaak-flow af (of check{" "}
            <code className="rounded bg-white/60 px-1">business_listings.business_id</code>).
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profiel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Profiel
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Beheer je bedrijfsgegevens, contact en beschrijving.
            </p>
          </CardHeader>
          <CardContent className="pt-2">
            <Button asChild variant="hero" className="w-full">
              <Link href={langHref(lang, `/business/edit/${business.id}`)}>
                <Pencil className="mr-2 h-4 w-4" />
                Profiel bewerken
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Mini-site */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Mini-site
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Mini-site is alleen beschikbaar in PRO of hoger.
            </p>
          </CardHeader>

          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              disabled={!showOpenMiniSite}
              asChild={!!listing?.id}
            >
              {listing?.id ? (
                <a href={langHref(lang, `/biz/${listing.id}`)} target="_blank" rel="noreferrer">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Open mini-site
                </a>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Open mini-site
                </>
              )}
            </Button>

            <Button
              variant="outlineSoft"
              className="w-full"
              disabled={!canUseMiniSiteSettings}
              asChild={!!listing?.id}
            >
              {listing?.id ? (
                <Link href={langHref(lang, `/business/mini-site/${listing.id}`)}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Mini-site instellingen
                </Link>
              ) : (
                <>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Mini-site instellingen
                </>
              )}
            </Button>

            {plan !== "pro" && (
              <Button asChild variant="hero" className="w-full">
                <Link href={langHref(lang, "/business/offers")}>
                  <Lock className="mr-2 h-4 w-4" />
                  Upgrade naar PRO
                </Link>
              </Button>
            )}

            <p className="text-xs text-muted-foreground">
              Mini-site wordt pas publiek bij status <span className="font-medium">active</span>.
            </p>
          </CardContent>
        </Card>

        {/* Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Limits
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Max categorieën</span>
              <span className="text-foreground">{caps.maxCategories}</span>
            </div>
            <div className="flex justify-between">
              <span>Max locaties</span>
              <span className="text-foreground">{caps.maxLocations}</span>
            </div>
            <div className="flex justify-between">
              <span>Max deals</span>
              <span className="text-foreground">{caps.maxDeals}</span>
            </div>
            <div className="flex justify-between">
              <span>Max foto’s</span>
              <span className="text-foreground">{caps.maxPhotos}</span>
            </div>
            <div className="flex justify-between">
              <span>Max video’s</span>
              <span className="text-foreground">{caps.maxVideos}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}