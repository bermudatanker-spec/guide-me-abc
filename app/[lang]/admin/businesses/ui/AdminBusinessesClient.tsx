"use client";

import React, { useEffect, useMemo, useState } from "react";

type Plan = "free" | "starter" | "growth" | "pro";
type Status = "active" | "inactive";

const PLANS: Plan[] = ["free", "starter", "growth", "pro"];
const STATUSES: Status[] = ["inactive", "active"];

type ApiBusiness = {
  id: string;
  name: string;
  island?: string | null;
  created_at?: string | null;
  subscription?: { plan: Plan; status: Status } | null;
};

type Row = {
  id: string;
  name: string;
  island: string;
  created_at: string;
  plan: Plan;
  status: Status;
  dirty: boolean;
  saving: boolean;
  error: string | null;
};

export default function AdminBusinessesClient({ lang }: { lang: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ ALTIJD array
  const [rows, setRows] = useState<Row[]>([]);

  const dirtyCount = useMemo(() => rows.filter((r) => r.dirty && !r.saving).length, [rows]);

  function normalize(b: ApiBusiness): Row {
    return {
      id: b.id,
      name: b.name ?? "",
      island: b.island ?? "",
      created_at: b.created_at ?? "",
      plan: b.subscription?.plan ?? "free",
      status: b.subscription?.status ?? "inactive",
      dirty: false,
      saving: false,
      error: null,
    };
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/businesses", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setRows([]);
        setError(json?.error ?? `HTTP ${res.status}`);
        return;
      }

      const list: ApiBusiness[] = Array.isArray(json?.businesses) ? json.businesses : [];
      setRows(list.map(normalize));
    } catch (e: any) {
      setRows([]);
      setError(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setRow(id: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async function saveOne(id: string) {
    const row = rows.find((r) => r.id === id);
    if (!row) return;

    setRow(id, { saving: true, error: null });

    try {
      const res = await fetch("/api/admin/businesses/subscription", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: row.id,
          plan: row.plan,
          status: row.status,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setRow(id, { saving: false, error: json?.error ?? `HTTP ${res.status}` });
        return;
      }

      setRow(id, { saving: false, dirty: false, error: null });
    } catch (e: any) {
      setRow(id, { saving: false, error: e?.message ?? "Save failed" });
    }
  }

  async function saveAll() {
    const ids = rows.filter((r) => r.dirty && !r.saving).map((r) => r.id);
    for (const id of ids) {
      // serial is ok (minder chaos)
      // eslint-disable-next-line no-await-in-loop
      await saveOne(id);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Admin · Businesses</h1>
        <p className="text-sm opacity-70">Loading…</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Admin · Businesses</h1>
        <span className="text-xs px-2 py-1 rounded bg-black/5">{String(lang).toUpperCase()}</span>

        <button
          className="ml-auto px-3 py-2 rounded bg-black text-white text-sm disabled:opacity-40"
          onClick={load}
          disabled={loading}
        >
          Refresh
        </button>

        <button
          className="px-3 py-2 rounded bg-blue-600 text-white text-sm disabled:opacity-40"
          onClick={saveAll}
          disabled={dirtyCount === 0}
          title="Alles opslaan"
        >
          Alles opslaan ({dirtyCount})
        </button>
      </div>

      {error && (
        <div className="p-3 rounded border border-red-300 bg-red-50 text-red-800 text-sm">
          <b>Fout</b>
          <div>{error}</div>
          {String(error).toLowerCase().includes("unauthorized") && (
            <div className="mt-1 opacity-80">
              Tip: als je 401 krijgt, ben je niet ingelogd als superadmin of cookies komen niet mee.
            </div>
          )}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="text-sm opacity-70">Geen resultaten.</div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="p-3 rounded border flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{r.name}</div>
                <div className="text-xs opacity-70">
                  {r.island || "-"} · {r.id}
                </div>
                {r.error && <div className="text-xs text-red-700 mt-1">{r.error}</div>}
              </div>

              <select
                className="border rounded px-2 py-1 text-sm"
                value={r.plan}
                onChange={(e) =>
                  setRow(r.id, { plan: e.target.value as Plan, dirty: true, error: null })
                }
              >
                {PLANS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>

              <select
                className="border rounded px-2 py-1 text-sm"
                value={r.status}
                onChange={(e) =>
                  setRow(r.id, { status: e.target.value as Status, dirty: true, error: null })
                }
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <button
                className="px-3 py-2 rounded bg-green-600 text-white text-sm disabled:opacity-40"
                onClick={() => saveOne(r.id)}
                disabled={!r.dirty || r.saving}
              >
                {r.saving ? "Opslaan…" : "Opslaan"}
              </button>

              <button
                className="px-3 py-2 rounded bg-black/5 text-sm"
                onClick={() => setRow(r.id, { dirty: false, error: null })}
                disabled={r.saving}
              >
                Reset
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}