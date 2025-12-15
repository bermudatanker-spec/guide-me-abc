"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type { Locale } from "@/i18n/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Undo2, Check, X, RefreshCw } from "lucide-react";

/* =========================
   SERVER ACTIONS (loos getypt!)
   ========================= */
import {
  adminListBusinessesAction,
  adminSetListingStatusAction,
  adminSetListingPlanAction,
  adminSoftDeleteBusinessAction,
  adminRestoreBusinessAction,
} from "../actions";

/* =========================
   TYPES (CLIENT-ONLY)
   ========================= */
type ListingStatus = "pending" | "active" | "inactive";
type Plan = "starter" | "growth" | "pro";

type Row = {
  business_id: string;
  business_name: string | null;
  island: string | null;

  status: ListingStatus | null;
  plan: Plan | null;

  deleted_at: string | null;

  subscription_status?: string | null;
  paid_until?: string | null;
};

type ListResult =
  | { ok: true; rows: Row[] }
  | { ok: false; error: string };

type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

/* ========================= */

export default function AdminBusinessesClient({ lang }: { lang: Locale }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  /* =========================
     LOAD
     ========================= */
  async function load() {
    setLoading(true);
    setError(null);

    try {
      const res = (await adminListBusinessesAction(lang)) as ListResult;
      if (!res.ok) throw new Error(res.error);

      // ✅ 1 rij per business_id → voorkomt duplicate React keys
      const map = new Map<string, Row>();
      for (const r of res.rows) {
        map.set(r.business_id, r);
      }

      setRows(Array.from(map.values()));
    } catch (e: any) {
      setError(e?.message ?? "Laden mislukt");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  /* =========================
     FILTER
     ========================= */
  const filtered = useMemo(() => {
    const needle = q.toLowerCase().trim();
    if (!needle) return rows;

    return rows.filter((r) =>
      [
        r.business_name,
        r.island,
        r.business_id,
        r.plan,
        r.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [rows, q]);

  /* =========================
     ACTION RUNNER
     ========================= */
  async function runAction(
    key: string,
    fn: () => Promise<ActionResult>
  ) {
    setBusyKey(key);
    setError(null);

    try {
      const res = await fn();
      if (!res.ok) throw new Error(res.error);
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Actie mislukt");
    } finally {
      setBusyKey(null);
    }
  }

  /* ========================= */

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* SEARCH */}
      <div className="flex gap-2 items-center">
        <Input
          placeholder="Zoek op naam, eiland of business_id…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-md"
        />
        <Button
          variant="outline"
          onClick={() => startTransition(() => load())}
          disabled={isPending}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-700 rounded">
          {error}
        </div>
      )}

      {/* LIST */}
      <div className="space-y-3">
        {filtered.map((r) => {
          const key = r.business_id;
          const isDeleted = Boolean(r.deleted_at);
          const busy = busyKey === key;

          return (
            <div
              key={key}
              className="border rounded-lg p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3"
            >
              <div>
                <div className="font-medium">
                  {r.business_name ?? "—"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {r.island ?? "—"} ·{" "}
                  <span className="font-mono text-xs">{r.business_id}</span>
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge>{isDeleted ? "Deleted" : r.status}</Badge>
                  <Badge variant="outline">Plan: {r.plan ?? "starter"}</Badge>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-wrap gap-2">
                {/* STATUS */}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy || isDeleted}
                  onClick={() =>
                    runAction(key, () =>
                      adminSetListingStatusAction(
                        lang,
                        r.business_id,
                        "active"
                      )
                    )
                  }
                >
                  <Check className="h-4 w-4 mr-1" />
                  Active
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy || isDeleted}
                  onClick={() =>
                    runAction(key, () =>
                      adminSetListingStatusAction(
                        lang,
                        r.business_id,
                        "inactive"
                      )
                    )
                  }
                >
                  <X className="h-4 w-4 mr-1" />
                  Inactive
                </Button>

                {/* PLAN */}
                {(["starter", "growth", "pro"] as Plan[]).map((p) => (
                  <Button
                    key={p}
                    size="sm"
                    variant="outline"
                    disabled={busy || isDeleted}
                    onClick={() =>
                      runAction(key, () =>
                        adminSetListingPlanAction(lang, r.business_id, p)
                      )
                    }
                  >
                    {p}
                  </Button>
                ))}

                {/* DELETE / RESTORE */}
                {!isDeleted ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={busy}
                    onClick={() =>
                      runAction(key, () =>
                        adminSoftDeleteBusinessAction(lang, r.business_id)
                      )
                    }
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Verwijderen
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() =>
                      runAction(key, () =>
                        adminRestoreBusinessAction(lang, r.business_id)
                      )
                    }
                  >
                    <Undo2 className="h-4 w-4 mr-1" />
                    Herstellen
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
