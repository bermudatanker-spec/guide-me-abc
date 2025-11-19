// app/[lang]/business/dashboard/ui/DashboardClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2, Plus, LogOut, Eye } from "lucide-react";

import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { langHref } from "@/lib/lang-href";
import { getLangFromPath } from "@/lib/locale-path";

/* -------------------------------------------------------
   Types – moeten overeenkomen met je Supabase SELECT
-------------------------------------------------------- */
type ListingRow = {
  id: string;
  business_name: string;
  island: "aruba" | "bonaire" | "curacao" | string;
  status: "pending" | "active" | "inactive" | string;
  subscription_plan: "starter" | "growth" | "pro" | string;
  categories: {
    name: string;
    slug: string;
  } | null;
};

type Props = {
  lang: string;
  t: Record<string, string>;
};

export default function DashboardClient({ lang, t }: Props) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const resolvedLang = (getLangFromPath(pathname) || lang) as "nl" | "en" | "pap" | "es";

  const supabase = useMemo(() => supabaseBrowser(), []);

  const [authLoading, setAuthLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /* 1) Auth check – haal current user op */
  useEffect(() => {
    let alive = true;

    (async () => {
      const { data, error } = await supabase.auth.getUser();

      console.log("[auth/mount] getUser:", { user: data?.user, error });

      if (!alive) return;

      if (!data?.user) {
        // fallback, middleware zou dit normaliter al tegenhouden
        router.replace(langHref(resolvedLang, "/business/auth"));
      } else {
        setUserId(data.user.id);
      }
      setAuthLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [router, supabase, resolvedLang]);

  /* 2) Data ophalen zodra userId bekend is */
  useEffect(() => {
    if (!userId) return; // wacht tot auth klaar is

    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const { data, error } = await supabase
          .from("business_listings")
          .select(
            `
            id,
            business_name,
            island,
            status,
            subscription_plan,
            categories:category_id (
              name,
              slug
            )
          `
          )
          .eq("owner_id", userId) // 🔑 ENKEL eigen bedrijven
          .order("created_at", { ascending: false })
          .returns<ListingRow[]>();

        console.log("[dashboard] listings:", { data, error });

        if (error) throw new Error(error.message);
        if (!alive) return;

        setListings(data ?? []);
      } catch (e: any) {
        if (!alive) return;
        setErrorMsg(e?.message ?? "Kon je bedrijven niet laden.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [supabase, userId]);

  /* 3) Acties */
  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace(`/${resolvedLang}`);
  }

  const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  /* 4) Loading states */
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  /* 5) Teksten (eventueel uit t) */
  const title = t.dashboardTitle ?? "Dashboard";
  const subtitle = t.dashboardSubtitle ?? "Manage your business registrations";
  const myBusinesses = t.myBusinesses ?? "My Businesses";
  const noBusinesses = t.noBusinesses ?? "You have no businesses yet.";
  const addBusiness = t.addBusiness ?? "Add Business";
  const logoutLabel = t.logout ?? "Log out";
  const miniSiteLabel = t.miniSite ?? "Mini-site";
  const editLabel = t.edit ?? "Edit";

  /* 6) Render */
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{title}</h1>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="hero"
              onClick={() => router.push(langHref(resolvedLang, "/business/create"))}
            >
              <Plus className="mr-2 h-4 w-4" />
              {addBusiness}
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              {logoutLabel}
            </Button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 rounded-md border border-red-500/40 bg-red-50 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{myBusinesses}</CardTitle>
          </CardHeader>
          <CardContent>
            {listings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">{noBusinesses}</p>
                <Button
                  variant="hero"
                  onClick={() => router.push(langHref(resolvedLang, "/business/create"))}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {addBusiness}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {listings.map((r) => {
                  const isPro = (r.subscription_plan ?? "").toLowerCase() === "pro";
                  const canViewMini = isPro && r.status === "active";

                  return (
                    <div
                      key={r.id}
                      className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">
                            {r.business_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {cap(r.island)} • {r.categories?.name ?? "—"}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              variant={isPro ? "default" : "secondary"}
                              className="capitalize"
                            >
                              {r.subscription_plan}
                            </Badge>
                            <Badge
                              variant={r.status === "active" ? "default" : "secondary"}
                              className="capitalize"
                            >
                              {r.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {canViewMini && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                window.open(langHref(resolvedLang, `/biz/${r.id}`), "_blank")
                              }
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              {miniSiteLabel}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(
                                langHref(resolvedLang, `/business/edit/${r.id}`)
                              )
                            }
                          >
                            {editLabel}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}