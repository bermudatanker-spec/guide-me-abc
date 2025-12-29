"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, Search, Trash2, CheckCircle2, XCircle, Zap } from "lucide-react";

import type { Locale } from "@/i18n/config";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { langHref } from "@/lib/lang-href";
import { getLangFromPath } from "@/lib/locale-path";
import { useToast } from "@/hooks/use-toast";
import { getRoleFlags } from "@/lib/auth/get-role-flags";

import VerifiedBadge from "@/components/business/VerifiedBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import type { DashboardListingRow } from "@/types/listing";

import {
  adminSetListingStatusAction,
  adminSetListingPlanAction,
  adminSoftDeleteBusinessAction,
  adminRestoreBusinessAction,
  adminSetListingVerifiedAction,
  type ListingStatus,
  type Plan,
} from "../actions";

type Props = {
  lang: Locale;
  t?: Record<string, string>;
};

function normalizePlan(p: unknown): Plan {
  const s = String(p ?? "").trim().toLowerCase();
  if (s === "pro") return "pro";
  if (s === "growth") return "growth";
  return "starter";
}

function normalizeStatus(s: unknown): ListingStatus {
  const v = String(s ?? "").trim().toLowerCase();
  if (v === "active") return "active";
  if (v === "inactive") return "inactive";
  return "pending";
}

export default function AdminBusinessesClient({ lang, t = {} }: Props) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const resolvedLang = (getLangFromPath(pathname) || lang) as Locale;

  const supabase = useMemo(() => supabaseBrowser(), []);
  const { toast } = useToast();

  const [authLoading, setAuthLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const [listings, setListings] = useState<DashboardListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // 1) Auth + super_admin gate
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

      const flags = getRoleFlags(data.user);
      const ok = !!flags?.isSuperAdmin;
      setIsSuperAdmin(ok);

      if (!ok) {
        router.replace(langHref(resolvedLang, "/business/dashboard"));
        return;
      }

      setAuthLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [router, supabase, resolvedLang]);

  // 2) Load listings (super_admin sees all)
  async function loadListings() {
    try {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("business_listings")
        .select(
          `
          id,
          business_id,
          business_name,
          is_verified,
          verified_at,
          island,
          status,
          owner_id,
          deleted_at,
          categories:category_id (name, slug),
          subscription:subscriptions ( plan )
        `
        )
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .returns<DashboardListingRow[]>();

      if (error) throw new Error(error.message);
      setListings(data ?? []);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Kon je bedrijven niet laden.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isSuperAdmin) return;
    void loadListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin]);

  async function runBusy(rowId: string, fn: () => Promise<any>) {
    setBusyId(rowId);
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
      await loadListings();
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

  // ✅ Actions — veilig: actions.ts resolved listingId/businessId zelf
  function setStatus(row: DashboardListingRow, status: ListingStatus) {
    return runBusy(row.id, () => adminSetListingStatusAction(resolvedLang, row.id, status));
  }

  function setPlan(row: DashboardListingRow, plan: Plan) {
    return runBusy(row.id, () => adminSetListingPlanAction(resolvedLang, row.id, plan));
  }

  function setVerified(row: DashboardListingRow, verified: boolean) {
    return runBusy(row.id, () => adminSetListingVerifiedAction(resolvedLang, row.id, verified));
  }

  function promoteToPro(row: DashboardListingRow) {
    return runBusy(row.id, async () => {
      const r1 = await adminSetListingPlanAction(resolvedLang, row.id, "pro");
      if (!r1?.ok) return r1;
      return adminSetListingStatusAction(resolvedLang, row.id, "active");
    });
  }

  function softDelete(row: DashboardListingRow) {
    const name = (row.business_name ?? "dit bedrijf").toString();
    const confirmed = window.confirm(`Weet je zeker dat je "${name}" wilt verwijderen?`);
    if (!confirmed) return;

    return runBusy(row.id, () => adminSoftDeleteBusinessAction(resolvedLang, row.id));
  }

  function restore(row: DashboardListingRow) {
    return runBusy(row.id, () => adminRestoreBusinessAction(resolvedLang, row.id));
  }

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = [...listings];

    if (q) {
      rows = rows.filter((r) => {
        const name = (r.business_name ?? "").toString().toLowerCase();
        const island = (r.island ?? "").toString().toLowerCase();
        const cat = (r.categories?.name ?? "").toString().toLowerCase();
        const status = (r.status ?? "").toString().toLowerCase();
        const plan = (r.subscription?.plan ?? "").toString().toLowerCase();
        const owner = (r.owner_id ?? "").toString().toLowerCase();
        return (
          name.includes(q) ||
          island.includes(q) ||
          cat.includes(q) ||
          status.includes(q) ||
          plan.includes(q) ||
          owner.includes(q)
        );
      });
    }

    rows.sort((a, b) =>
      (a.business_name ?? "")
        .toString()
        .localeCompare((b.business_name ?? "").toString(), "nl", { sensitivity: "base" })
    );

    return rows;
  }, [listings, search]);

  const title = t.adminBusinessesTitle ?? "Admin · Businesses";
  const subtitle = t.adminBusinessesSubtitle ?? "Beheer alle bedrijven (super_admin).";

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSuperAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 rounded-md border border-red-500/40 bg-red-50 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <div className="mb-4 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Zoek op naam, eiland, status, plan, owner…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Alle bedrijven</CardTitle>
          </CardHeader>

          <CardContent>
            {visible.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">Geen resultaten.</div>
            ) : (
              <div className="space-y-4">
                {visible.map((r) => {
                  const plan = normalizePlan(r.subscription?.plan);
                  const status = normalizeStatus(r.status);
                  const isBusy = busyId === r.id;

                  return (
                    <div
                      key={r.id}
                      className="border border-border rounded-lg p-4 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-lg text-foreground">
                              {(r.business_name ?? "—").toString()}
                            </h3>
                            <VerifiedBadge verified={r.is_verified} verifiedAt={r.verified_at} compact />
                          </div>

                          <p className="text-sm text-muted-foreground">
                            {r.island ?? "—"} • {r.categories?.name ?? "—"}
                            {r.owner_id ? (
                              <>
                                {" "}
                                •{" "}
                                <span className="text-xs text-muted-foreground/80">
                                  owner: {r.owner_id.slice(0, 8)}…
                                </span>
                              </>
                            ) : null}
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
                          <Button variant="hero" size="sm" disabled={isBusy} onClick={() => promoteToPro(r)}>
                            <Zap className="h-4 w-4 mr-1" />
                            Pro + actief
                          </Button>

                          <Button variant="outlineSoft" size="sm" disabled={isBusy} onClick={() => setStatus(r, "active")}>
                            {isBusy ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3 mr-1.5" />
                            )}
                            Active
                          </Button>

                          <Button variant="outlineSoft" size="sm" disabled={isBusy} onClick={() => setStatus(r, "pending")}>
                            <XCircle className="h-3 w-3 mr-1.5" />
                            Pending
                          </Button>

                          <Button variant="outlineSoft" size="sm" disabled={isBusy} onClick={() => setStatus(r, "inactive")}>
                            Inactive
                          </Button>

                          <Button variant="outlineSoft" size="sm" disabled={isBusy} onClick={() => setPlan(r, "starter")}>
                            Starter
                          </Button>

                          <Button variant="outlineSoft" size="sm" disabled={isBusy} onClick={() => setPlan(r, "growth")}>
                            Growth
                          </Button>

                          <Button variant="outlineSoft" size="sm" disabled={isBusy} onClick={() => setPlan(r, "pro")}>
                            Pro
                          </Button>

                          <Button variant="outlineSoft" size="sm" disabled={isBusy} onClick={() => setVerified(r, true)}>
                            Verify
                          </Button>

                          <Button variant="outlineSoft" size="sm" disabled={isBusy} onClick={() => setVerified(r, false)}>
                            Unverify
                          </Button>

                          <Button variant="destructive" size="sm" disabled={isBusy} onClick={() => softDelete(r)}>
                            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>

                          {/* Restore knop (optioneel) */}
                          {/* <Button variant="outlineSoft" size="sm" disabled={isBusy} onClick={() => restore(r)}>
                            Restore
                          </Button> */}
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