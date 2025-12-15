"use client";

import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { Loader2, RefreshCw, Trash2, RotateCcw, Check, X } from "lucide-react";

// ✅ Import ONLY functions (geen types) — voorkomt TS errors na actions.ts wijzigingen
import * as Actions from "../actions";

// ✅ maak lokale refs (compile-proof)
const adminListBusinessesAction = (Actions as any).adminListBusinessesAction as (
  lang: any
) => Promise<any>;

const adminRestoreBusinessAction = (Actions as any).adminRestoreBusinessAction as (
  lang: any,
  businessId: string,
  note?: string
) => Promise<any>;

const adminSoftDeleteBusinessAction = (Actions as any).adminSoftDeleteBusinessAction as (
  lang: any,
  businessId: string,
  note?: string
) => Promise<any>;

const adminSetListingPlanAction = (Actions as any).adminSetListingPlanAction as (
  lang: any,
  businessId: string,
  plan: "starter" | "growth" | "pro",
  note?: string
) => Promise<any>;

const adminSetListingStatusAction = (Actions as any).adminSetListingStatusAction as (
  lang: any,
  businessId: string,
  status: "active" | "inactive" | "pending",
  note?: string
) => Promise<any>;

// --------------------
// Local safe types
// --------------------
type Plan = "starter" | "growth" | "pro";
type ListingStatus = "pending" | "active" | "inactive";

type AdminBusinessRow = {
  business_id: string;
  listing_id?: string | null;

  business_name?: string | null;
  island?: string | null;

  status?: ListingStatus | null; // listing status
  plan?: Plan | null;            // subscription plan (latest)
  subscription_status?: string | null;
  paid_until?: string | null;    // kan bij jou ends_at zijn -> gevuld in actions

  deleted_at?: string | null;
};

type ListResult = { ok: true; rows: AdminBusinessRow[] } | { ok: false; error: string };

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

function norm(s: string | null | undefined) {
  return (s ?? "").trim().toLowerCase();
}

function isExpired(iso?: string | null) {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() < Date.now();
}

export default function AdminBusinessesClient({ lang }: { lang: Locale }) {
  const { toast } = useToast();

  const [rows, setRows] = useState<AdminBusinessRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [island, setIsland] = useState<string>("all");
  const [showDeleted, setShowDeleted] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<"all" | ListingStatus>("all");
  const [planFilter, setPlanFilter] = useState<"all" | Plan>("all");
  const [expiredFilter, setExpiredFilter] = useState<"all" | "only" | "hide">("all");

  async function load() {
    setLoading(true);
    try {
      // ✅ tolerant: actions signature kan verschillen; we gebruiken "any"
      const res = (await (adminListBusinessesAction as any)(lang)) as ListResult | any;

      if (!res?.ok) {
        toast({
          variant: "destructive",
          title: "Kon bedrijven niet laden",
          description: res?.error ?? "Onbekende fout",
        });
        setRows([]);
        return;
      }

      setRows((res.rows ?? []) as AdminBusinessRow[]);
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Serverfout",
        description: e?.message ?? "Onbekende fout",
      });
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const qq = norm(q);

    return rows.filter((r) => {
      const deleted = Boolean(r.deleted_at);
      if (!showDeleted && deleted) return false;

      if (island !== "all" && norm(r.island) !== norm(island)) return false;

      if (statusFilter !== "all" && (r.status ?? null) !== statusFilter) return false;

      if (planFilter !== "all" && (r.plan ?? null) !== planFilter) return false;

      const expired = isExpired(r.paid_until);
      if (expiredFilter === "only" && !expired) return false;
      if (expiredFilter === "hide" && expired) return false;

      if (!qq) return true;
      const hay = [
        r.business_name ?? "",
        r.island ?? "",
        r.business_id ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(qq);
    });
  }, [rows, q, island, showDeleted, statusFilter, planFilter, expiredFilter]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const active = filtered.filter((r) => r.status === "active" && !r.deleted_at).length;
    const inactive = filtered.filter((r) => r.status === "inactive" && !r.deleted_at).length;
    const deleted = filtered.filter((r) => Boolean(r.deleted_at)).length;
    const expired = filtered.filter((r) => isExpired(r.paid_until)).length;
    const paid = filtered.filter((r) => (r.plan === "growth" || r.plan === "pro")).length;
    const free = filtered.filter((r) => r.plan === "starter" || !r.plan).length;

    return { total, active, inactive, deleted, expired, paid, free };
  }, [filtered]);

  async function runAction(key: string, fn: () => Promise<any>) {
    setBusyKey(key);
    try {
      const res = await fn();
      if (!res?.ok) {
        toast({
          variant: "destructive",
          title: "Actie mislukt",
          description: res?.error ?? "Onbekende fout",
        });
      } else {
        toast({ title: "Gelukt ✅" });
        await load();
      }
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Serverfout",
        description: e?.message ?? "Onbekende fout",
      });
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header / Stats */}
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="text-2xl font-semibold">Admin · Businesses</div>
          <div className="text-sm text-muted-foreground">
            {stats.total} zichtbaar
          </div>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span className="ml-2">Refresh</span>
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-6">
        <div className="rounded-xl border p-3">
          <div className="text-sm text-muted-foreground">Totaal</div>
          <div className="text-xl font-semibold">{stats.total}</div>
        </div>
        <div className="rounded-xl border p-3">
          <div className="text-sm text-muted-foreground">Active</div>
          <div className="text-xl font-semibold">{stats.active}</div>
        </div>
        <div className="rounded-xl border p-3">
          <div className="text-sm text-muted-foreground">Inactive</div>
          <div className="text-xl font-semibold">{stats.inactive}</div>
        </div>
        <div className="rounded-xl border p-3">
          <div className="text-sm text-muted-foreground">Deleted</div>
          <div className="text-xl font-semibold">{stats.deleted}</div>
        </div>
        <div className="rounded-xl border p-3">
          <div className="text-sm text-muted-foreground">Paid</div>
          <div className="text-xl font-semibold">{stats.paid}</div>
          <div className="text-xs text-muted-foreground">(heuristic)</div>
        </div>
        <div className="rounded-xl border p-3">
          <div className="text-sm text-muted-foreground">Free</div>
          <div className="text-xl font-semibold">{stats.free}</div>
          <div className="text-xs text-muted-foreground">(heuristic)</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Zoek op naam, eiland, status, plan of business_id..."
          className="max-w-md"
        />

        <Button
          variant={showDeleted ? "default" : "outline"}
          onClick={() => setShowDeleted((v) => !v)}
        >
          Verwijderd: {showDeleted ? "tonen" : "verbergen"}
        </Button>

        <Button
          variant={expiredFilter === "only" ? "default" : "outline"}
          onClick={() => setExpiredFilter((v) => (v === "only" ? "all" : "only"))}
        >
          Expired: {expiredFilter === "only" ? "alleen" : "alles"}
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            setQ("");
            setIsland("all");
            setShowDeleted(false);
            setStatusFilter("all");
            setPlanFilter("all");
            setExpiredFilter("all");
          }}
        >
          Reset
        </Button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-xl border p-6 text-sm text-muted-foreground">Geen resultaten.</div>
        ) : (
          filtered.map((r, idx) => {
            const isDeleted = Boolean(r.deleted_at);
            const isPending = busyKey === (r.listing_id ?? r.business_id ?? String(idx));
            const key = r.listing_id ?? r.business_id ?? `${idx}`;

            return (
              <div key={key} className="rounded-xl border p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{r.business_name ?? "—"}</div>
                    <div className="text-sm text-muted-foreground">
                      {r.island ?? "—"} · ID: {r.business_id}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Plan: <span className="font-medium">{r.plan ?? "starter"}</span> · Paid until:{" "}
                      <span className={isExpired(r.paid_until) ? "font-medium" : ""}>
                        {fmtDate(r.paid_until)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {r.status === "active" ? (
                      <Badge>Active</Badge>
                    ) : r.status === "inactive" ? (
                      <Badge variant="secondary">Inactive</Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}

                    {isDeleted && <Badge variant="destructive">Deleted</Badge>}
                    {isExpired(r.paid_until) && <Badge variant="secondary">Expired</Badge>}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Status */}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending || isDeleted}
                    onClick={() =>
                      runAction(key, () =>
                        (adminSetListingStatusAction as any)(lang, r.business_id, "active")
                      )
                    }
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1.5" />}
                    Active
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending || isDeleted}
                    onClick={() =>
                      runAction(key, () =>
                        (adminSetListingStatusAction as any)(lang, r.business_id, "inactive")
                      )
                    }
                  >
                    <X className="h-4 w-4 mr-1.5" />
                    Inactive
                  </Button>

                  {/* Plan */}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending || isDeleted}
                    onClick={() =>
                      runAction(key, () =>
                        (adminSetListingPlanAction as any)(lang, r.business_id, "starter")
                      )
                    }
                  >
                    Starter
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending || isDeleted}
                    onClick={() =>
                      runAction(key, () =>
                        (adminSetListingPlanAction as any)(lang, r.business_id, "growth")
                      )
                    }
                  >
                    Growth
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending || isDeleted}
                    onClick={() =>
                      runAction(key, () =>
                        (adminSetListingPlanAction as any)(lang, r.business_id, "pro")
                      )
                    }
                  >
                    Pro
                  </Button>

                  {/* Delete / Restore */}
                  {isDeleted ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() =>
                        runAction(key, () =>
                          (adminRestoreBusinessAction as any)(lang, r.business_id)
                        )
                      }
                    >
                      <RotateCcw className="h-4 w-4 mr-1.5" />
                      Restore
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={isPending}
                      onClick={() =>
                        runAction(key, () =>
                          (adminSoftDeleteBusinessAction as any)(lang, r.business_id)
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4 mr-1.5" />
                      Verwijderen
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
