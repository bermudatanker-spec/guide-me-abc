// app/[lang]/business/dashboard/ui/DashboardClient.tsx
"use client";

import type { Locale } from "@/i18n/config";
import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Loader2,
  Plus,
  LogOut,
  Eye,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  Zap,
} from "lucide-react";

import { supabaseBrowser } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { langHref } from "@/lib/lang-href";
import { getLangFromPath } from "@/lib/locale-path";
import { useToast } from "@/hooks/use-toast";

/* -------------------------------------------------------
   Types – aansluiten op je Supabase schema
-------------------------------------------------------- */
type ListingRow = {
  id: string;
  business_name: string;
  island: "aruba" | "bonaire" | "curacao" | string;
  status: "pending" | "active" | "inactive" | string;
  subscription_plan: "starter" | "growth" | "pro" | string;
  owner_id: string;
  categories: {
    name: string;
    slug: string;
  } | null;
};

type Props = {
  lang: Locale;
  t: Record<string, string>;
};

export default function DashboardClient({ lang, t }: Props) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const resolvedLang = (getLangFromPath(pathname) || lang) as
    | "nl"
    | "en"
    | "pap"
    | "es";

  const supabase = useMemo(() => supabaseBrowser(), []);
  const { toast } = useToast();

  const [authLoading, setAuthLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* 1) Auth check – user + rollen ophalen ------------------- */
  useEffect(() => {
    let alive = true;

    (async () => {
      const { data, error } = await supabase.auth.getUser();
      console.log("[dashboard/auth] getUser", { data, error });

      if (!alive) return;

      if (!data?.user) {
        router.replace(langHref(resolvedLang, "/business/auth"));
        return;
      }

      setUserId(data.user.id);

      const roles = (data.user.app_metadata as any)?.roles ?? [];
      const rolesArr = Array.isArray(roles) ? roles : [];
      const isAdm =
        rolesArr.includes("admin") || rolesArr.includes("superadmin");

      setIsAdmin(isAdm);
      setAuthLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [router, supabase, resolvedLang]);

  /* 2) Data ophalen zodra userId bekend is ------------------- */
  useEffect(() => {
    if (!userId) return;

    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        let query = supabase
          .from("business_listings")
          .select(
            `
            id,
            business_name,
            island,
            status,
            subscription_plan,
            owner_id,
            categories:category_id (
              name,
              slug
            )
          `
          );

        // Normale gebruiker: alleen eigen bedrijven
        if (!isAdmin) {
          query = query.eq("owner_id", userId);
        }

        const { data, error } = await query
          .order("created_at", { ascending: false })
          .returns<ListingRow[]>();

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
  }, [supabase, userId, isAdmin]);

  /* 3) Acties ------------------------------------- */

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace(`/${resolvedLang}`);
  }

  /** generieke patch helper voor status / plan */
  async function patchListing(
    id: string,
    patch: Partial<Pick<ListingRow, "status" | "subscription_plan">>,
    successMsg?: string
  ) {
    try {
      setUpdatingId(id);

      const { error } = await supabase
        .from("business_listings")
        .update(patch)
        .eq("id", id);

      if (error) throw new Error(error.message);

      setListings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...patch } : b))
      );

      if (successMsg) {
        toast({
          title: successMsg,
        });
      }
    } catch (e: any) {
      toast({
        title: "Fout",
        description: e?.message ?? "Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  }

  /** Alleen status wijzigen (admin) */
  function updateStatus(id: string, status: ListingRow["status"]) {
    return patchListing(id, { status }, `Status bijgewerkt naar ${status}`);
  }

  /** Alleen plan wijzigen (admin) */
  function updatePlan(
    id: string,
    plan: ListingRow["subscription_plan"]
  ) {
    return patchListing(
      id,
      { subscription_plan: plan },
      `Abonnement aangepast naar ${plan}`
    );
  }

  /** 1-klik “Maak Pro + actief” (admin) */
  function promoteToPro(id: string) {
    return patchListing(
      id,
      { subscription_plan: "pro", status: "active" },
      "Bedrijf is nu Pro + actief"
    );
  }

  /** Verwijderen (owner + admin) */
  async function deleteListing(id: string, name: string) {
    const ok = window.confirm(
      `Weet je zeker dat je "${name}" wilt verwijderen?`
    );
    if (!ok) return;

    try {
      setDeletingId(id);
      const { error } = await supabase
        .from("business_listings")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);

      setListings((prev) => prev.filter((b) => b.id !== id));

      toast({
        title: "Verwijderd",
        description: `"${name}" is verwijderd.`,
      });
    } catch (e: any) {
      toast({
        title: "Fout bij verwijderen",
        description: e?.message ?? "Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  }

  /* 4) Filter + sort voor weergave ---------------- */

  const visibleListings = useMemo(() => {
    let rows = [...listings];

    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter((r) => {
        const island = (r.island ?? "").toString().toLowerCase();
        const cat = (r.categories?.name ?? "")
          .toString()
          .toLowerCase();
        const status = (r.status ?? "").toString().toLowerCase();
        const plan = (r.subscription_plan ?? "")
          .toString()
          .toLowerCase();

        return (
          r.business_name.toLowerCase().includes(q) ||
          island.includes(q) ||
          cat.includes(q) ||
          status.includes(q) ||
          plan.includes(q)
        );
      });
    }

    if (isAdmin) {
      rows.sort((a, b) =>
        a.business_name.localeCompare(b.business_name, "nl", {
          sensitivity: "base",
        })
      );
    }

    return rows;
  }, [listings, search, isAdmin]);

  /* 5) Teksten ---------------------- */
  const title = t.dashboardTitle ?? "Dashboard";
  const subtitle =
    t.dashboardSubtitle ?? "Beheer je bedrijfsregistraties";
  const myBusinesses = t.myBusinesses ?? "Mijn bedrijven";
  const noBusinesses =
    t.noBusinesses ?? "Je hebt nog geen bedrijven.";
  const addBusiness = t.addBusiness ?? "Bedrijf toevoegen";
  const logoutLabel = t.logout ?? "Uitloggen";
  const miniSiteLabel = t.view ?? "Mini-site";
  const editLabel = t.edit ?? "Bewerken";

  /* 6) Loading state ---------------- */
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  /* 7) UI -------------------------- */
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {subtitle}
            </p>
            {isAdmin && (
              <p className="mt-1 text-xs text-emerald-700">
                Je bent ingelogd als <strong>admin</strong> – je
                ziet alle bedrijven.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="hero"
              onClick={() =>
                router.push(
                  langHref(resolvedLang, "/business/create")
                )
              }
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

        {/* Zoekbalk */}
        <div className="mb-4 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Zoek op naam, eiland, status…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{myBusinesses}</CardTitle>
          </CardHeader>
          <CardContent>
            {visibleListings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {noBusinesses}
                </p>
                <Button
                  variant="hero"
                  onClick={() =>
                    router.push(
                      langHref(resolvedLang, "/business/create")
                    )
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {addBusiness}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {visibleListings.map((r) => {
                  const isPro =
                    (r.subscription_plan ?? "")
                      .toLowerCase()
                      .trim() === "pro";
                  const canViewMini = r.status === "active";
                  const isBusy =
                    updatingId === r.id || deletingId === r.id;

                  return (
                    <div
                      key={r.id}
                      className="border border-border rounded-lg p-4 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">
                            {r.business_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {r.island
                              ? `${r.island
                                  .toString()
                                  .charAt(0)
                                  .toUpperCase()}${r.island
                                  .toString()
                                  .slice(1)}`
                              : "—"}{" "}
                            • {r.categories?.name ?? "—"}
                            {isAdmin && (
                              <>
                                {" "}
                                •{" "}
                                <span className="text-xs text-muted-foreground/80">
                                  owner: {r.owner_id.slice(0, 8)}…
                                </span>
                              </>
                            )}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge
                              variant={isPro ? "default" : "secondary"}
                              className="capitalize"
                            >
                              {r.subscription_plan || "starter"}
                            </Badge>
                            <Badge
                              variant={
                                r.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                              className="capitalize"
                            >
                              {r.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-end">
                          {/* Admin status/plan controls */}
                          {isAdmin && (
                            <>
                              {/* 1-klik Pro + actief */}
                              <Button
                                variant="hero"
                                size="sm"
                                disabled={isBusy}
                                onClick={() => promoteToPro(r.id)}
                              >
                                <Zap className="h-4 w-4 mr-1" />
                                Pro + actief
                              </Button>

                              {/* Status buttons */}
                              <Button
                                variant="outlineSoft"
                                size="sm"
                                disabled={isBusy}
                                onClick={() =>
                                  updateStatus(r.id, "active")
                                }
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1.5" />
                                Active
                              </Button>
                              <Button
                                variant="outlineSoft"
                                size="sm"
                                disabled={isBusy}
                                onClick={() =>
                                  updateStatus(r.id, "pending")
                                }
                              >
                                <XCircle className="h-3 w-3 mr-1.5" />
                                Pending
                              </Button>
                              <Button
                                variant="outlineSoft"
                                size="sm"
                                disabled={isBusy}
                                onClick={() =>
                                  updateStatus(r.id, "inactive")
                                }
                              >
                                Inactive
                              </Button>

                              {/* Plan shortcuts */}
                              <Button
                                variant="outlineSoft"
                                size="sm"
                                disabled={isBusy}
                                onClick={() =>
                                  updatePlan(r.id, "starter")
                                }
                              >
                                Starter
                              </Button>
                              <Button
                                variant="outlineSoft"
                                size="sm"
                                disabled={isBusy}
                                onClick={() =>
                                  updatePlan(r.id, "growth")
                                }
                              >
                                Growth
                              </Button>
                              <Button
                                variant="outlineSoft"
                                size="sm"
                                disabled={isBusy}
                                onClick={() =>
                                  updatePlan(r.id, "pro")
                                }
                              >
                                Pro
                              </Button>
                            </>
                          )}

                          {/* Mini-site bekijken (alleen als active) */}
                          {canViewMini && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isBusy}
                              onClick={() =>
                                window.open(
                                  langHref(
                                    resolvedLang,
                                    `/biz/${r.id}`
                                  ),
                                  "_blank"
                                )
                              }
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              {miniSiteLabel}
                            </Button>
                          )}

                          {/* Mini-site instellingen (alleen voor PRO) */}
                          {isPro && (
                            <Button
                             variant="outlineSoft"
                             size="sm"
                             disabled={isBusy}
                             onClick={() =>
                              router.push(
                                langHref(resolvedLang, `/business/mini-site/${r.id}`)
                                 )
                               }
                             >
                              {resolvedLang === "nl" ? "Mini-site instellingen" : "Mini-site settings"}
                              </Button>
                           )}


                          {/* Bewerken */}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isBusy}
                            onClick={() =>
                              router.push(
                                langHref(
                                  resolvedLang,
                                  `/business/edit/${r.id}`
                                )
                              )
                            }
                          >
                            {editLabel}
                          </Button>

                          {/* Verwijderen */}
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isBusy}
                            onClick={() =>
                              deleteListing(r.id, r.business_name)
                            }
                          >
                            {deletingId === r.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
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