"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  Pencil,
  Globe,
  Lock,
  Sparkles,
  BarChart3,
  Loader2,
} from "lucide-react";

import type { Locale } from "@/i18n/config";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { getLangFromPath } from "@/lib/locale-path";
import { langHref } from "@/lib/lang-href";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Props = {
  lang: Locale;
};

type BusinessRow = {
  id: string;
  user_id: string;
  name: string | null;
  island: string | null;
  slug: string | null;
};

type ListingRow = {
  id: string;
  business_id: string | null;
  business_name: string | null;
  island: string | null;
  status: string | null;
  subscription_plan: string | null;
};

function normalizePlan(plan: unknown): "starter" | "growth" | "pro" {
  const p = String(plan ?? "")
    .trim()
    .toLowerCase();

  if (p === "pro") return "pro";
  if (p === "growth") return "growth";
  return "starter";
}

function normalizeStatus(status: unknown): "pending" | "active" | "inactive" {
  const s = String(status ?? "")
    .trim()
    .toLowerCase();

  if (s === "active") return "active";
  if (s === "inactive") return "inactive";
  return "pending";
}

function planLimits(plan: "starter" | "growth" | "pro") {
  // pas dit gerust aan aan jouw echte product rules
  if (plan === "pro") {
    return { categories: 10, locations: 10, deals: 20, photos: 50, videos: 10 };
  }
  if (plan === "growth") {
    return { categories: 5, locations: 3, deals: 5, photos: 20, videos: 2 };
  }
  return { categories: 1, locations: 1, deals: 1, photos: 10, videos: 0 };
}

export default function DashboardHome({ lang }: Props) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const resolvedLang = (getLangFromPath(pathname) || lang) as Locale;

  const supabase = useMemo(() => supabaseBrowser(), []);

  const redirectingRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [business, setBusiness] = useState<BusinessRow | null>(null);
  const [listing, setListing] = useState<ListingRow | null>(null);

  const plan = useMemo(
    () => normalizePlan(listing?.subscription_plan),
    [listing?.subscription_plan]
  );
  const status = useMemo(
    () => normalizeStatus(listing?.status),
    [listing?.status]
  );
  const limits = useMemo(() => planLimits(plan), [plan]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        // 1) Auth user
        const { data: authData, error: authErr } = await supabase.auth.getUser();
        const user = authData?.user;

        if (!alive) return;

        if (authErr) throw new Error(authErr.message);

        if (!user) {
          if (!redirectingRef.current) {
            redirectingRef.current = true;
            router.replace(langHref(resolvedLang, "/business/auth"));
          }
          return;
        }

        // 2) Business (owner = businesses.user_id)
        const { data: b, error: bErr } = await supabase
          .from("businesses")
          .select("id, user_id, name, island, slug")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle<BusinessRow>();

        if (!alive) return;
        if (bErr) throw new Error(bErr.message);

        // Geen business record -> naar create flow
        if (!b?.id) {
          if (!redirectingRef.current) {
            redirectingRef.current = true;
            router.replace(langHref(resolvedLang, "/business/create"));
          }
          return;
        }

        setBusiness(b);

        // 3) Listing via business_id (status + plan + listing id)
        const { data: l, error: lErr } = await supabase
          .from("business_listings")
          .select("id, business_id, business_name, island, status, subscription_plan")
          .eq("business_id", b.id)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle<ListingRow>();

        if (!alive) return;
        if (lErr) throw new Error(lErr.message);

        setListing(l ?? null);
      } catch (e: any) {
        if (!alive) return;
        setErrorMsg(e?.message ?? "Onbekende fout");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    // Optioneel: auth state listener (signOut -> redirect)
    const { data: sub } = supabase.auth.onAuthStateChange((evt) => {
      if (evt === "SIGNED_OUT") {
        if (!redirectingRef.current) {
          redirectingRef.current = true;
          router.replace(langHref(resolvedLang, "/business/auth"));
        }
      }
    });

    return () => {
      alive = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, [router, supabase, resolvedLang]);

  const title = resolvedLang === "nl" ? "Dashboard" : "Dashboard";
  const profileTitle = resolvedLang === "nl" ? "Profiel" : "Profile";
  const profileDesc =
    resolvedLang === "nl"
      ? "Beheer je bedrijfsgegevens, contact en beschrijving."
      : "Manage your business details, contact and description.";
  const editProfileLabel =
    resolvedLang === "nl" ? "Profiel bewerken" : "Edit profile";

  const minisiteTitle = resolvedLang === "nl" ? "Mini-site" : "Mini-site";
  const minisiteDesc =
    resolvedLang === "nl"
      ? "Mini-site is alleen beschikbaar in PRO of hoger."
      : "Mini-site is available in PRO or higher.";
  const openMinisite =
    resolvedLang === "nl" ? "Open mini-site" : "Open mini-site";
  const upgradeLabel =
    resolvedLang === "nl" ? "Upgrade naar PRO" : "Upgrade to PRO";

  const limitsTitle = resolvedLang === "nl" ? "Limits" : "Limits";

  const showOpenMiniSite = status === "active" && !!listing?.id; // jouw mini-site route gebruikt listing.id
  const canUseMiniSiteSettings = plan === "pro" && !!listing?.id;

  const businessName =
    listing?.business_name?.trim() ||
    business?.name?.trim() ||
    "—";

  const island =
    (listing?.island || business?.island || "—")
      ?.toString()
      ?.trim();

  if (loading) {
    return (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{resolvedLang === "nl" ? "Laden…" : "Loading…"}</span>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>

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

        {errorMsg && (
          <div className="mt-4 rounded-md border border-red-500/40 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {!listing && (
          <div className="mt-4 rounded-md border border-amber-500/40 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {resolvedLang === "nl"
              ? "Nog geen listing gevonden. Rond eerst je aanmaak-flow af (of check business_listings.business_id)."
              : "No listing found yet. Finish your create flow (or check business_listings.business_id)."}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profiel */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {profileTitle}
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{profileDesc}</p>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <Button
              variant="hero"
              className="w-full"
              disabled={!business?.id}
              onClick={() => {
                if (!business?.id) return;
                router.push(langHref(resolvedLang, `/business/edit/${business.id}`));
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              {editProfileLabel}
            </Button>

            {!business?.id && (
              <p className="mt-3 text-xs text-muted-foreground">
                {resolvedLang === "nl"
                  ? "Geen business gevonden."
                  : "No business found."}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Mini-site */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {minisiteTitle}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{minisiteDesc}</p>
          </CardHeader>

          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              disabled={!showOpenMiniSite}
              onClick={() => {
                if (!listing?.id) return;
                window.open(langHref(resolvedLang, `/biz/${listing.id}`), "_blank");
              }}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {openMinisite}
            </Button>

            <Button
              variant="outlineSoft"
              className="w-full"
              disabled={!canUseMiniSiteSettings}
              onClick={() => {
                if (!listing?.id) return;
                router.push(langHref(resolvedLang, `/business/mini-site/${listing.id}`));
              }}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              {resolvedLang === "nl" ? "Mini-site instellingen" : "Mini-site settings"}
            </Button>

            {plan !== "pro" && (
              <Button
                variant="hero"
                className="w-full"
                onClick={() => {
                  // pas dit aan naar jouw billing/upgrade route
                  router.push(langHref(resolvedLang, "/business/offers"));
                }}
              >
                <Lock className="mr-2 h-4 w-4" />
                {upgradeLabel}
              </Button>
            )}

            <p className="text-xs text-muted-foreground">
              {resolvedLang === "nl"
                ? "Mini-site wordt pas publiek bij status active."
                : "Mini-site becomes public only when status is active."}
            </p>
          </CardContent>
        </Card>

        {/* Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {limitsTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>{resolvedLang === "nl" ? "Max categorieën" : "Max categories"}</span>
              <span className="text-foreground">{limits.categories}</span>
            </div>
            <div className="flex justify-between">
              <span>{resolvedLang === "nl" ? "Max locaties" : "Max locations"}</span>
              <span className="text-foreground">{limits.locations}</span>
            </div>
            <div className="flex justify-between">
              <span>{resolvedLang === "nl" ? "Max deals" : "Max deals"}</span>
              <span className="text-foreground">{limits.deals}</span>
            </div>
            <div className="flex justify-between">
              <span>{resolvedLang === "nl" ? "Max foto’s" : "Max photos"}</span>
              <span className="text-foreground">{limits.photos}</span>
            </div>
            <div className="flex justify-between">
              <span>{resolvedLang === "nl" ? "Max video’s" : "Max videos"}</span>
              <span className="text-foreground">{limits.videos}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}