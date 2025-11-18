"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2, Plus, LogOut, Eye } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { langHref } from "@/lib/lang-href";
import { getLangFromPath } from "@/lib/locale-path";

/** ───────────────── Types uit DB ───────────────── */
type Listing = {
  id: string;
  business_name: string;
  island: "aruba" | "bonaire" | "curacao" | string;
  category_id: string | null; // uuid in jouw schema
  status: "pending" | "active" | "inactive" | string;
  subscription_plan: "starter" | "growth" | "pro" | string | null;
  created_at: string;
};

export default function DashboardClient({
  lang,
  t,
}: {
  lang: string;
  t: Record<string, string>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const resolvedLang = getLangFromPath(pathname) || lang;

  const supabase = useMemo(() => supabaseBrowser(), []);

  const [authLoading, setAuthLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /** 1) Auth check */
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!alive) return;

      if (error) {
        setErrorMsg(error.message);
        setUserId(null);
        setAuthLoading(false);
        return;
      }

      if (!data?.user) {
        // niet ingelogd → naar auth
        router.replace(langHref(resolvedLang, "/business/auth"));
        return;
      }

      setUserId(data.user.id);
      setAuthLoading(false);
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 2) Data ophalen zodra userId bekend is */
  useEffect(() => {
    if (!userId) return; // wacht op auth
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const { data, error } = await supabase
          .from("business_listings")
          .select("*")
          .eq("owner_id", userId) // filter op eigen records
          .order("created_at", { ascending: false });

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

  /** 3) Actions */
  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace(`/${resolvedLang}`);
  }

  /** 4) UI helpers */
  const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  /** 5) Loading */
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  /** 6) Teksten */
  const H1 = t.dashboardTitle ?? "Dashboard";
  const Sub = t.dashboardSubtitle ?? "Manage your business registrations";
  const addLabel = t.addBusiness ?? "Add Business";
  const editLabel = t.edit ?? "Edit";
  const viewLabel = t.view ?? "Mini-site";
  const logoutLabel = t.logout ?? "Log out";
  const myBusinesses = t.myBusinesses ?? "My Businesses";
  const noBusinesses = t.noBusinesses ?? "You have no businesses yet";
  const addFirstBusiness =
    t.addFirstBusiness ?? "Start by adding your first business";
  const businessSingular = t.business ?? "business";
  const businessPlural = t.businesses ?? "businesses";

  /** 7) Render */
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">{H1}</h1>
          <p className="text-muted-foreground">{Sub}</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          {logoutLabel}
        </Button>
      </div>

      {errorMsg && (
        <div className="mb-6 p-3 rounded-md border border-red-500/40 bg-red-50 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{myBusinesses}</CardTitle>
          <CardDescription>
            {listings.length === 0
              ? noBusinesses
              : `${listings.length} ${
                  listings.length === 1 ? businessSingular : businessPlural
                }`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {listings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">{addFirstBusiness}</p>
              <Button
                onClick={() =>
                  router.push(langHref(resolvedLang, "/business/create"))
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                {addLabel}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((l) => {
                const plan = (l.subscription_plan ?? "starter").toLowerCase();
                const isPro = plan === "pro";
                const status = (l.status ?? "pending").toLowerCase();

                return (
                  <div
                    key={l.id}
                    className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">
                          {l.business_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {cap(l.island)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant={isPro ? "default" : "secondary"}
                            className="capitalize"
                          >
                            {plan}
                          </Badge>
                          <Badge
                            variant={
                              status === "active" ? "default" : "secondary"
                            }
                            className="capitalize"
                          >
                            {status}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {isPro && status === "active" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(
                                langHref(resolvedLang, `/biz/${l.id}`),
                                "_blank",
                              )
                            }
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {viewLabel}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(
                              langHref(resolvedLang, `/business/edit/${l.id}`),
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

              <Button
                onClick={() =>
                  router.push(langHref(resolvedLang, "/business/create"))
                }
                className="w-full"
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                {addLabel}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}