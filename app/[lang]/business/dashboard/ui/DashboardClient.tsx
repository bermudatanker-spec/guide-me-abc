"use client";

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

import type { Locale } from "@/i18n/config";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { langHref } from "@/lib/lang-href";
import { getLangFromPath } from "@/lib/locale-path";
import { useToast } from "@/hooks/use-toast";

// ✅ server actions (mutaties alleen via server)
import {
  adminSetListingStatusAction,
  adminSetListingPlanAction,
  adminSoftDeleteBusinessAction,
  adminRestoreBusinessAction,
  setListingStatusAction,
  setListingPlanAction,
  softDeleteListingAction,
  type ListingStatus,
  type Plan,
} from "../actions";

/* -------------------------------------------------------
   Types – aansluiten op je Supabase schema (read-only)
-------------------------------------------------------- */
type ListingRow = {
  id: string;
  business_id: string;
  business_name: string;
  island: string;
  status: string;
  owner_id: string;
  deleted_at?: string | null;
  categories: { name: string; slug: string } | null;
  subscription?: {
    plan: "starter" | "growth" | "pro";
  } | null;
};

type Props = {
  lang: Locale;
  t: Record<string, string>;
};

function normalizePlan(p: any): Plan {
  const s = String(p ?? "").trim().toLowerCase();
  if (s === "pro") return "pro";
  if (s === "growth") return "growth";
  return "starter";
}
function normalizeStatus(s: any): ListingStatus {
  const v = String(s ?? "").trim().toLowerCase();
  if (v === "active") return "active";
  if (v === "inactive") return "inactive";
  return "pending";
}

export default function DashboardClient({ lang, t }: Props) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const resolvedLang = (getLangFromPath(pathname) || lang) as "nl" | "en" | "pap" | "es";
  const supabase = useMemo(() => supabaseBrowser(), []);
  const { toast } = useToast();

  const [authLoading, setAuthLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  /* 1) Auth check – user + role ophalen ------------------- */
  useEffect(() => {
    let alive = true;

    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!alive) return;

      if (error) {
        setErrorMsg(error.message);
        setAuthLoading(false);
        return;
      }

      if (!data?.user) {
        router.replace(langHref(resolvedLang, "/business/auth"));
        return;
      }

      setUserId(data.user.id);

      const role = ((data.user.app_metadata as any)?.role ?? (data.user as any)?.role ?? "")
        .toString()
        .toLowerCase();

      setIsSuperAdmin(role === "super_admin" || role === "superadmin");
      setAuthLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [router, supabase, resolvedLang]);

  /* 2) Data ophalen zodra userId bekend is ------------------- */
  async function loadListings(uid: string, superAdmin: boolean) {
    try {
      setLoading(true);
      setErrorMsg(null);

      let query = supabase
  .from("business_listings")
  .select(`
    id,
    business_id,
    business_name,
    island,
    status,
    owner_id,
    deleted_at,
    categories:category_id (name, slug),
    subscription:subscriptions (
      plan
    )
  `)
  .is("deleted_at", null)
  .order("created_at", { ascending: false });

      // Owner ziet alleen eigen listings (RLS/kolom)
      if (!superAdmin) {
        query = query.eq("owner_id", uid);
      }

      // ✅ alleen actieve (niet deleted) tonen op owner dashboard
      query = query.is("deleted_at", null);

      const { data, error } = await query.returns<ListingRow[]>();
      if (error) throw new Error(error.message);

      setListings(data ?? []);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Kon je bedrijven niet laden.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!userId) return;
    void loadListings(userId, isSuperAdmin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isSuperAdmin]);

  /* 3) Acties ------------------------------------- */
  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace(`/${resolvedLang}`);
  }

  async function runBusy(id: string, fn: () => Promise<any>) {
    setBusyId(id);
    try {
      const res = await fn();
      if (!res?.ok) {
        toast({
          title: "Fout",
          description: res?.error ?? "Onbekende fout",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Gelukt ✅" });
      if (userId) await loadListings(userId, isSuperAdmin);
    } catch (e: any) {
      toast({
        title: "Serverfout",
        description: e?.message ?? "Onbekende fout",
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  }

  // ✅ Admin: status/plan via server actions (en niet meer client update)
  function adminUpdateStatus(listing: ListingRow, status: ListingStatus) {
    return runBusy(listing.id, () => adminSoftDeleteBusinessAction(resolvedLang, listing.business_id));
  }
  function adminUpdatePlan(listing: ListingRow, plan: Plan) {
    // Jij hebt adminSetListingPlanAction in admin-actions file? (zo ja)
    // Als niet: gebruik setListingPlanAction hieronder (maar dan moet admin via RLS kunnen).
    return runBusy(listing.id, () => adminSetListingPlanAction(resolvedLang, listing.business_id, plan));
  }
  function promoteToPro(listing: ListingRow) {
    return runBusy(listing.id, async () => {
      const r1 = await adminSetListingPlanAction(resolvedLang, listing.business_id, "pro");
      if (!r1?.ok) return r1;
      return adminSetListingStatusAction(resolvedLang, listing.id, "active");
    });
  }

  // ✅ Owner: (optioneel) status/plan via server actions (alleen als je dit echt wil in owner dashboard)
  function ownerUpdateStatus(listing: ListingRow, status: ListingStatus) {
    return runBusy(listing.id, () => setListingStatusAction(resolvedLang, listing.id, status));
  }
  function ownerUpdatePlan(listing: ListingRow, plan: Plan) {
    return runBusy(listing.id, () => setListingPlanAction(resolvedLang, listing.id, plan));
  }

  // ✅ soft delete (geen hard delete)
  function deleteListing(listing: ListingRow) {
    const ok = window.confirm(`Weet je zeker dat je "${listing.business_name}" wilt verwijderen?`);
    if (!ok) return;

    if (isSuperAdmin) {
      return runBusy(listing.id, () => adminSoftDeleteBusinessAction(resolvedLang, listing.id));
    }
    return runBusy(listing.id, () => softDeleteListingAction(resolvedLang, listing.id));
  }

  /* 4) Filter + sort ---------------- */
  const visibleListings = useMemo(() => {
    let rows = [...listings];
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter((r) => {
        const island = (r.island ?? "").toString().toLowerCase();
        const cat = (r.categories?.name ?? "").toString().toLowerCase();
        const status = (r.status ?? "").toString().toLowerCase();
        const plan = (r.subscription?.plan ?? "").toString().toLowerCase();
        return (
          r.business_name.toLowerCase().includes(q) ||
          island.includes(q) ||
          cat.includes(q) ||
          status.includes(q) ||
          plan.includes(q)
        );
      });
    }

    if (isSuperAdmin) {
      rows.sort((a, b) =>
        a.business_name.localeCompare(b.business_name, "nl", { sensitivity: "base" })
      );
    }
    return rows;
  }, [listings, search, isSuperAdmin]);

  /* 5) Teksten ---------------------- */
  const title = t.dashboardTitle ?? "Dashboard";
  const subtitle = t.dashboardSubtitle ?? "Beheer je bedrijfsregistraties";
  const myBusinesses = t.myBusinesses ?? "Mijn bedrijven";
  const noBusinesses = t.noBusinesses ?? "Je hebt nog geen bedrijven.";
  const addBusiness = t.addBusiness ?? "Bedrijf toevoegen";
  const logoutLabel = t.logout ?? "Uitloggen";
  const miniSiteLabel = t.view ?? "Mini-site";
  const editLabel = t.edit ?? "Bewerken";

  /* 6) Loading ---------------------- */
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
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>

            {isSuperAdmin && (
              <p className="mt-1 text-xs text-emerald-700">
                Je bent ingelogd als <strong>super_admin</strong> – je ziet alle bedrijven.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
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

        {/* Search */}
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
                {visibleListings.map((r) => {
                  const plan = normalizePlan(r.subscription?.plan);
                  const status = normalizeStatus(r.status);
                  const isBusy = busyId === r.id;

                  const canViewMini = status === "active";

                  return (
                    <div
                      key={r.id}
                      className="border border-border rounded-lg p-4 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">{r.business_name}</h3>

                          <p className="text-sm text-muted-foreground">
                            {r.island ?? "—"} • {r.categories?.name ?? "—"}
                            {isSuperAdmin && (
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
                            <Badge variant={plan === "pro" ? "default" : "secondary"} className="capitalize">
                              {plan}
                            </Badge>
                            <Badge variant={status === "active" ? "default" : "secondary"} className="capitalize">
                              {status}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-end">
                          {/* ✅ Admin controls */}
                          {isSuperAdmin && (
                            <>
                              <Button
                                variant="hero"
                                size="sm"
                                disabled={isBusy}
                                onClick={() => promoteToPro(r)}
                              >
                                <Zap className="h-4 w-4 mr-1" />
                                Pro + actief
                              </Button>

                              <Button
                                variant="outlineSoft"
                                size="sm"
                                disabled={isBusy}
                                onClick={() => adminUpdateStatus(r, "active")}
                              >
                                {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-3 w-3 mr-1.5" />}
                                Active
                              </Button>

                              <Button
                                variant="outlineSoft"
                                size="sm"
                                disabled={isBusy}
                                onClick={() => adminUpdateStatus(r, "pending")}
                              >
                                <XCircle className="h-3 w-3 mr-1.5" />
                                Pending
                              </Button>

                              <Button
                                variant="outlineSoft"
                                size="sm"
                                disabled={isBusy}
                                onClick={() => adminUpdateStatus(r, "inactive")}
                              >
                                Inactive
                              </Button>

                              <Button
                                variant="outlineSoft"
                                size="sm"
                                disabled={isBusy}
                                onClick={() => adminUpdatePlan(r, "starter")}
                              >
                                Starter
                              </Button>

                              <Button
                                variant="outlineSoft"
                                size="sm"
                                disabled={isBusy}
                                onClick={() => adminUpdatePlan(r, "growth")}
                              >
                                Growth
                              </Button>

                              <Button
                                variant="outlineSoft"
                                size="sm"
                                disabled={isBusy}
                                onClick={() => adminUpdatePlan(r, "pro")}
                              >
                                Pro
                              </Button>
                            </>
                          )}

                          {/* Mini-site (alleen active) */}
                          {canViewMini && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isBusy}
                              onClick={() => window.open(langHref(resolvedLang, `/biz/${r.id}`), "_blank")}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              {miniSiteLabel}
                            </Button>
                          )}

                          {/* Bewerken */}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isBusy}
                            onClick={() =>
                              router.push(langHref(resolvedLang, `/business/edit/${r.id}`))
                            }
                          >
                            {editLabel}
                          </Button>

                          {/* Verwijderen (soft) */}
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isBusy}
                            onClick={() => deleteListing(r)}
                          >
                            {isBusy ? (
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