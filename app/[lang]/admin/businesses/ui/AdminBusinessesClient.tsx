"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2, Search, CheckCircle2, XCircle, Trash2, RotateCcw } from "lucide-react";

import type { Locale } from "@/i18n/config";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { langHref } from "@/lib/lang-href";
import { getLangFromPath } from "@/lib/locale-path";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  adminSetListingStatusAction,
  adminSetListingPlanAction,
  adminSoftDeleteBusinessAction,
  adminRestoreBusinessAction,
  type ListingStatus,
  type Plan,
} from "../actions";

type ListingRow = {
  id: string; // listing id
  business_id: string;
  business_name: string;
  island: string;
  status: string;
  subscription_plan: string | null;
  owner_id: string;
  deleted_at: string | null;
};

type Props = {
  lang: Locale;
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

export default function AdminBusinessesClient({ lang }: Props) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const resolvedLang = (getLangFromPath(pathname) || lang) as Locale;

  const supabase = useMemo(() => supabaseBrowser(), []);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<ListingRow[]>([]);

  async function load() {
    try {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("business_listings")
        .select("id,business_id,business_name,island,status,subscription_plan,owner_id,deleted_at")
        .is("deleted_at", null)
        .order("business_name", { ascending: true })
        .returns<ListingRow[]>();

      if (error) throw new Error(error.message);

      setRows(data ?? []);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Kon listings niet laden");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      return (
        (r.business_name ?? "").toLowerCase().includes(q) ||
        (r.island ?? "").toLowerCase().includes(q) ||
        (r.status ?? "").toLowerCase().includes(q) ||
        (r.subscription_plan ?? "").toLowerCase().includes(q) ||
        (r.business_id ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, search]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Admin – Businesses</h1>
          <p className="text-sm text-muted-foreground">Beheer status + plan (Starter/Growth/Pro)</p>
        </div>

        <Button variant="outline" onClick={() => router.push(langHref(resolvedLang, "/"))}>
          Terug
        </Button>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-md border border-red-500/40 bg-red-50 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <div className="mb-4 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Zoek op naam, eiland, status, plan…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Businesses ({visible.length})</CardTitle>
          <Button variant="outline" onClick={() => load()}>
            Refresh
          </Button>
        </CardHeader>

        <CardContent className="space-y-3">
          {visible.map((r) => {
            const plan = normalizePlan(r.subscription_plan);
            const status = normalizeStatus(r.status);
            const isBusy = busyKey?.includes(r.business_id) ?? false;

            return (
              <div key={r.id} className="border border-border rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div>
                    <div className="font-semibold text-lg">{r.business_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {r.island} • business_id: <span className="font-mono text-xs">{r.business_id}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge className="capitalize" variant={plan === "pro" ? "default" : "secondary"}>
                        {plan}
                      </Badge>
                      <Badge className="capitalize" variant={status === "active" ? "default" : "secondary"}>
                        {status}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-end">
                    {/* STATUS */}
                    <Button
                      size="sm"
                      variant="outlineSoft"
                      disabled={isBusy}
                      onClick={() =>
                        runBusy(`status:${r.business_id}`, () =>
                          adminSetListingStatusAction(resolvedLang, r.business_id, "active")
                        )
                      }
                    >
                      {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                      Active
                    </Button>

                    <Button
                      size="sm"
                      variant="outlineSoft"
                      disabled={isBusy}
                      onClick={() =>
                        runBusy(`status:${r.business_id}`, () =>
                          adminSetListingStatusAction(resolvedLang, r.business_id, "pending")
                        )
                      }
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Pending
                    </Button>

                    <Button
                      size="sm"
                      variant="outlineSoft"
                      disabled={isBusy}
                      onClick={() =>
                        runBusy(`status:${r.business_id}`, () =>
                          adminSetListingStatusAction(resolvedLang, r.business_id, "inactive")
                        )
                      }
                    >
                      Inactive
                    </Button>

                    {/* PLAN */}
                    <Button
                      size="sm"
                      variant="outlineSoft"
                      disabled={isBusy}
                      onClick={() =>
                        runBusy(`plan:${r.business_id}`, () =>
                          adminSetListingPlanAction(resolvedLang, r.business_id, "starter")
                        )
                      }
                    >
                      Starter
                    </Button>

                    <Button
                      size="sm"
                      variant="outlineSoft"
                      disabled={isBusy}
                      onClick={() =>
                        runBusy(`plan:${r.business_id}`, () =>
                          adminSetListingPlanAction(resolvedLang, r.business_id, "growth")
                        )
                      }
                    >
                      Growth
                    </Button>

                    <Button
                      size="sm"
                      variant="outlineSoft"
                      disabled={isBusy}
                      onClick={() =>
                        runBusy(`plan:${r.business_id}`, () =>
                          adminSetListingPlanAction(resolvedLang, r.business_id, "pro")
                        )
                      }
                    >
                      Pro
                    </Button>

                    {/* DELETE / RESTORE */}
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={isBusy}
                      onClick={() => {
                        const ok = window.confirm(`Soft delete "${r.business_name}"?`);
                        if (!ok) return;
                        runBusy(`del:${r.business_id}`, () =>
                          adminSoftDeleteBusinessAction(resolvedLang, r.business_id)
                        );
                      }}
                    >
                      {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isBusy}
                      onClick={() =>
                        runBusy(`restore:${r.business_id}`, () =>
                          adminRestoreBusinessAction(resolvedLang, r.business_id)
                        )
                      }
                      title="Restore (als deleted_at is gezet)"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </main>
  );
}