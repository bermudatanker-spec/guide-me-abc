"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, Search, CheckCircle2, XCircle, Trash2, Zap } from "lucide-react";

import type { Locale } from "@/i18n/config";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { langHref } from "@/lib/lang-href";
import { getLangFromPath } from "@/lib/locale-path";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  adminSetListingStatusAction,
  adminSetListingPlanAction,
  adminSoftDeleteBusinessAction,
  adminRestoreBusinessAction,
  type ListingStatus,
  type Plan,
} from "../actions";

/* -------------------------------------------------------
   Types (komt uit VIEW: business_listings_admin_view)
-------------------------------------------------------- */
type Row = {
  id: string; // listing id
  business_id: string;
  business_name: string;
  island: string;
  status: string;
  plan: string; // ✅ uit view
  owner_id: string;
  deleted_at: string | null;
  categories: { name: string; slug: string } | null;
};

type Props = { lang: Locale };

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

export default function AdminBusinessesClient({ lang }: Props) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";

  // ✅ FIX: resolvedLang is écht Locale → geen rode kronkels bij actions calls
  const resolvedLang = (getLangFromPath(pathname) || lang) as Locale;

  const supabase = useMemo(() => supabaseBrowser(), []);
  const { toast } = useToast();

  const [authLoading, setAuthLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ✅ Admin gate (super_admin)
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!alive) return;

      if (error || !data?.user) {
        router.replace(langHref(resolvedLang, "/business/auth"));
        return;
      }

      const role = ((data.user.app_metadata as any)?.role ?? (data.user as any)?.role ?? "")
        .toString()
        .toLowerCase();

      if (!(role === "super_admin" || role === "superadmin")) {
        router.replace(langHref(resolvedLang, "/business/dashboard"));
        return;
      }

      setAuthLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [router, supabase, resolvedLang]);

  async function load() {
    try {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("business_listings_admin_view")
        .select(
          `
          id,
          business_id,
          business_name,
          island,
          status,
          plan,
          owner_id,
          deleted_at,
          categories:category_id (name, slug)
        `
        )
        .order("business_name", { ascending: true });

      if (error) throw new Error(error.message);
      setRows((data as any) ?? []);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Kon admin bedrijven niet laden.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  async function runBusy(key: string, fn: () => Promise<any>) {
    setBusyKey(key);
    try {
      const res = await fn();
      if (!res?.ok) {
        toast({ title: "Fout", description: res?.error ?? "Onbekende fout", variant: "destructive" });
        return;
      }
      toast({ title: "Gelukt ✅" });
      await load();
    } catch (e: any) {
      toast({ title: "Serverfout", description: e?.message ?? "Onbekende fout", variant: "destructive" });
    } finally {
      setBusyKey(null);
    }
  }

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r) => {
      const s = `${r.business_name} ${r.island} ${r.status} ${r.plan} ${r.categories?.name ?? ""}`.toLowerCase();
      return s.includes(q);
    });
  }, [rows, search]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-3xl font-bold">Admin • Bedrijven</h1>
          <p className="text-sm text-muted-foreground">Status + plan beheren (plan komt uit subscriptions → view).</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 rounded-md border border-red-500/40 bg-red-50 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <div className="mb-4 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Zoek..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Businesses ({visible.length})</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {visible.map((r) => {
                const plan = normalizePlan(r.plan);
                const status = normalizeStatus(r.status);
                const isBusy = busyKey?.includes(r.business_id) ?? false;

                return (
                  <div key={r.id} className="border border-border rounded-lg p-4 hover:bg-muted/40 transition-colors">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="font-semibold text-lg">{r.business_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {r.island} • {r.categories?.name ?? "—"} • owner: {r.owner_id.slice(0, 8)}…
                        </div>

                        <div className="flex gap-2 mt-2">
                          <Badge variant={plan === "pro" ? "default" : "secondary"} className="capitalize">
                            {plan}
                          </Badge>
                          <Badge variant={status === "active" ? "default" : "secondary"} className="capitalize">
                            {status}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 justify-end">
                        <Button
                          variant="hero"
                          size="sm"
                          disabled={isBusy}
                          onClick={() =>
                            runBusy(`pro:${r.business_id}`, async () => {
                              const a = await adminSetListingPlanAction(resolvedLang, r.business_id, "pro");
                              if (!a?.ok) return a;
                              return adminSetListingStatusAction(resolvedLang, r.business_id, "active");
                            })
                          }
                        >
                          <Zap className="h-4 w-4 mr-1" />
                          Pro + actief
                        </Button>

                        <Button
                          variant="outlineSoft"
                          size="sm"
                          disabled={isBusy}
                          onClick={() =>
                            runBusy(`st:${r.business_id}`, () =>
                              adminSetListingStatusAction(resolvedLang, r.business_id, "active")
                            )
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
                            runBusy(`st:${r.business_id}`, () =>
                              adminSetListingStatusAction(resolvedLang, r.business_id, "pending")
                            )
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
                            runBusy(`st:${r.business_id}`, () =>
                              adminSetListingStatusAction(resolvedLang, r.business_id, "inactive")
                            )
                          }
                        >
                          Inactive
                        </Button>

                        <Button
                          variant="outlineSoft"
                          size="sm"
                          disabled={isBusy}
                          onClick={() =>
                            runBusy(`pl:${r.business_id}`, () =>
                              adminSetListingPlanAction(resolvedLang, r.business_id, "starter")
                            )
                          }
                        >
                          Starter
                        </Button>

                        <Button
                          variant="outlineSoft"
                          size="sm"
                          disabled={isBusy}
                          onClick={() =>
                            runBusy(`pl:${r.business_id}`, () =>
                              adminSetListingPlanAction(resolvedLang, r.business_id, "growth")
                            )
                          }
                        >
                          Growth
                        </Button>

                        <Button
                          variant="outlineSoft"
                          size="sm"
                          disabled={isBusy}
                          onClick={() =>
                            runBusy(`pl:${r.business_id}`, () =>
                              adminSetListingPlanAction(resolvedLang, r.business_id, "pro")
                            )
                          }
                        >
                          Pro
                        </Button>

                        {r.deleted_at ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isBusy}
                            onClick={() =>
                              runBusy(`rs:${r.business_id}`, () =>
                                adminRestoreBusinessAction(resolvedLang, r.business_id)
                              )
                            }
                          >
                            Restore
                          </Button>
                        ) : (
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isBusy}
                            onClick={() => {
                              const ok = window.confirm(`Soft delete "${r.business_name}"?`);
                              if (!ok) return;
                              runBusy(`del:${r.business_id}`, () =>
                                adminSoftDeleteBusinessAction(resolvedLang, r.business_id)
                              );
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}