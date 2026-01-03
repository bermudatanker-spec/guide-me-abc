"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

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

function safePlan(v: unknown): Plan {
  return (PLANS.includes(v as Plan) ? v : "free") as Plan;
}
function safeStatus(v: unknown): Status {
  return (STATUSES.includes(v as Status) ? v : "inactive") as Status;
}

function useDebounced<T>(value: T, ms = 200) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export default function AdminBusinessesClient({ lang }: { lang: string }) {
  // ✅ jouw bestaande browser client
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);

  // filters/search/paging (1000+ proof)
  const [q, setQ] = useState("");
  const qDebounced = useDebounced(q, 200);

  const [islandFilter, setIslandFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<Plan | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [pageSize, setPageSize] = useState<25 | 50 | 100>(50);
  const [page, setPage] = useState(1);

  const topRef = useRef<HTMLDivElement | null>(null);

  const dirtyCount = useMemo(
    () => rows.filter((r) => r.dirty && !r.saving).length,
    [rows]
  );

  function normalize(b: ApiBusiness): Row {
    return {
      id: String(b.id ?? ""),
      name: String(b.name ?? ""),
      island: String(b.island ?? ""),
      created_at: String(b.created_at ?? ""),
      plan: safePlan(b.subscription?.plan),
      status: safeStatus(b.subscription?.status),
      dirty: false,
      saving: false,
      error: null,
    };
  }

  function setRow(id: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  // ✅ FIX: voorkomt duplicate react keys + dubbele rijen
  function dedupeById(list: Row[]): Row[] {
    const map = new Map<string, Row>();
    for (const r of list) {
      if (!r?.id) continue;
      if (!map.has(r.id)) map.set(r.id, r);
    }
    return Array.from(map.values());
  }

  async function load() {
    setLoading(true);
    setPageError(null);

    try {
      // (optioneel) check login, helpt bij debugging
      await supabase.auth.getSession();

      const res = await fetch("/api/admin/businesses", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRows([]);
        setPageError(json?.error ?? `HTTP ${res.status}`);
        return;
      }

      const list: ApiBusiness[] = Array.isArray(json?.businesses)
        ? json.businesses
        : [];

      setRows(dedupeById(list.map(normalize)));
    } catch (e: any) {
      setRows([]);
      setPageError(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  // ✅ Save via API route (stabieler dan client rpc qua permissions)
  async function saveOne(id: string) {
    const row = rows.find((r) => r.id === id);
    if (!row || row.saving) return;

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
      // eslint-disable-next-line no-await-in-loop
      await saveOne(id);
    }
  }

  const islands = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) if (r.island) set.add(r.island);
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [rows]);

  const filtered = useMemo(() => {
    const qq = qDebounced.trim().toLowerCase();
    const out = rows.filter((r) => {
      if (qq) {
        const hay = `${r.name} ${r.id} ${r.island}`.toLowerCase();
        if (!hay.includes(qq)) return false;
      }
      if (islandFilter !== "all" && r.island !== islandFilter) return false;
      if (planFilter !== "all" && r.plan !== planFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      return true;
    });
    out.sort((a, b) => a.name.localeCompare(b.name));
    return out;
  }, [rows, qDebounced, islandFilter, planFilter, statusFilter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [qDebounced, islandFilter, planFilter, statusFilter, pageSize]);

  function jumpTop() {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // === Luxe “site-like” styling classes ===
  const panel =
    "rounded-3xl border border-white/30 bg-white/10 backdrop-blur-xl shadow-xl";
  const input =
    "w-full rounded-2xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40";
  const btnPrimary =
    "rounded-2xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold shadow disabled:opacity-40";
  const btnDark =
    "rounded-2xl bg-black text-white px-4 py-2.5 text-sm font-semibold shadow disabled:opacity-40";
  const btnSoft =
    "rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-semibold border border-white/20 hover:bg-white/15 disabled:opacity-40";

  if (loading) {
    return (
      <main className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className={`${panel} p-6`}>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Admin · Businesses
          </h1>
          <p className="text-sm opacity-70 mt-2">Loading…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-4">
      <div ref={topRef} />

      {/* Header + filters */}
      <section className={`${panel} p-5 sm:p-6`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Admin · Businesses
            </h1>
            <p className="text-sm opacity-70 mt-1">
              {total} resultaten · {dirtyCount} wijziging{dirtyCount === 1 ? "" : "en"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded bg-white/10 border border-white/20">
              {String(lang).toUpperCase()}
            </span>

            <button className={btnDark} onClick={load}>
              Refresh
            </button>

            <button className={btnPrimary} onClick={saveAll} disabled={dirtyCount === 0}>
              Alles opslaan ({dirtyCount})
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            className={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Zoek (naam / eiland / id)…"
          />

          <select className={input} value={islandFilter} onChange={(e) => setIslandFilter(e.target.value)}>
            {islands.map((i) => (
              <option key={i} value={i}>
                {i === "all" ? "Alle eilanden" : i}
              </option>
            ))}
          </select>

          <select className={input} value={planFilter} onChange={(e) => setPlanFilter(e.target.value as any)}>
            <option value="all">Alle plannen</option>
            {PLANS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select className={input} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
            <option value="all">Alle statussen</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select className={input} value={pageSize} onChange={(e) => setPageSize(Number(e.target.value) as any)}>
            <option value={25}>25 / pagina</option>
            <option value={50}>50 / pagina</option>
            <option value={100}>100 / pagina</option>
          </select>
        </div>

        {pageError ? (
          <div className="mt-4 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-red-800 text-sm">
            <b>Fout:</b> {pageError}
          </div>
        ) : null}
      </section>

      {/* DESKTOP TABLE */}
      <section className={`${panel} hidden lg:block`}>
        <div className="overflow-auto rounded-3xl">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-background/70 backdrop-blur-xl">
              <tr className="text-left border-b border-white/20">
                <th className="px-4 py-3 font-semibold">Bedrijf</th>
                <th className="px-4 py-3 font-semibold w-[140px]">Eiland</th>
                <th className="px-4 py-3 font-semibold w-[160px]">Plan</th>
                <th className="px-4 py-3 font-semibold w-[160px]">Status</th>
                <th className="px-4 py-3 font-semibold w-[240px] text-right">Acties</th>
              </tr>
            </thead>

            {/* ✅ geen whitespace text nodes */}
            <tbody>
              {pageItems.map((r) => (
                <tr key={r.id} className="border-b border-white/10">
                  <td className="px-4 py-3 align-top">
                    <div className="font-semibold">{r.name || "(zonder naam)"}</div>
                    <div className="text-xs opacity-70 mt-1 flex items-center gap-2">
                      <span className="truncate max-w-[520px]">{r.id}</span>
                      <button
                        type="button"
                        className="text-xs px-2 py-1 rounded bg-white/10 border border-white/20 hover:bg-white/15"
                        onClick={() => navigator.clipboard.writeText(r.id)}
                      >
                        kopieer
                      </button>

                      {r.dirty ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-amber-500/15 text-amber-700">
                          gewijzigd
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-700">
                          ok
                        </span>
                      )}
                    </div>

                    {r.error ? <div className="text-xs text-red-700 mt-2">{r.error}</div> : null}
                  </td>

                  <td className="px-4 py-3 align-top">{r.island || "-"}</td>

                  <td className="px-4 py-3 align-top">
                    <select
                      className={input}
                      value={r.plan}
                      onChange={(e) =>
                        setRow(r.id, { plan: safePlan(e.target.value), dirty: true, error: null })
                      }
                    >
                      {PLANS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-3 align-top">
                    <select
                      className={input}
                      value={r.status}
                      onChange={(e) =>
                        setRow(r.id, {
                          status: safeStatus(e.target.value),
                          dirty: true,
                          error: null,
                        })
                      }
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-3 align-top">
                    <div className="flex justify-end gap-2">
                      <button
                        className={btnPrimary}
                        onClick={() => saveOne(r.id)}
                        disabled={!r.dirty || r.saving}
                      >
                        {r.saving ? "Opslaan…" : "Opslaan"}
                      </button>

                      <button
                        className={btnSoft}
                        onClick={() => setRow(r.id, { dirty: false, error: null })}
                        disabled={r.saving}
                      >
                        Reset
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {pageItems.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 opacity-70" colSpan={5}>
                    Geen resultaten.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
          <div className="text-xs opacity-70">
            Pagina {safePage} / {totalPages} · {total} totaal
          </div>

          <div className="flex items-center gap-2">
            <button
              className={btnSoft}
              disabled={safePage === 1}
              onClick={() => {
                setPage(1);
                jumpTop();
              }}
            >
              Eerste
            </button>
            <button
              className={btnSoft}
              disabled={safePage === 1}
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                jumpTop();
              }}
            >
              Vorige
            </button>
            <button
              className={btnSoft}
              disabled={safePage === totalPages}
              onClick={() => {
                setPage((p) => Math.min(totalPages, p + 1));
                jumpTop();
              }}
            >
              Volgende
            </button>
            <button
              className={btnSoft}
              disabled={safePage === totalPages}
              onClick={() => {
                setPage(totalPages);
                jumpTop();
              }}
            >
              Laatste
            </button>
          </div>
        </div>
      </section>

      {/* MOBILE CARDS */}
      <section className="lg:hidden space-y-3">
        {pageItems.length === 0 ? (
          <div className={`${panel} p-6 text-sm opacity-70`}>Geen resultaten.</div>
        ) : (
          pageItems.map((r) => (
            <article key={r.id} className={`${panel} p-5`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{r.name || "(zonder naam)"}</div>
                  <div className="text-xs opacity-70 mt-1 truncate">{r.island || "-"}</div>
                </div>

                {r.dirty ? (
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-500/15 text-amber-700">
                    gewijzigd
                  </span>
                ) : (
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-700">
                    ok
                  </span>
                )}
              </div>

              <div className="mt-2 flex items-center gap-2">
                <code className="text-[11px] opacity-70 truncate flex-1">{r.id}</code>
                <button
                  className="text-xs px-2 py-1 rounded bg-white/10 border border-white/20 hover:bg-white/15"
                  onClick={() => navigator.clipboard.writeText(r.id)}
                >
                  kopieer
                </button>
              </div>

              {r.error ? <div className="text-xs text-red-700 mt-2">{r.error}</div> : null}

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs opacity-70 mb-1">Plan</div>
                  <select
                    className={input}
                    value={r.plan}
                    onChange={(e) =>
                      setRow(r.id, { plan: safePlan(e.target.value), dirty: true, error: null })
                    }
                  >
                    {PLANS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="text-xs opacity-70 mb-1">Status</div>
                  <select
                    className={input}
                    value={r.status}
                    onChange={(e) =>
                      setRow(r.id, { status: safeStatus(e.target.value), dirty: true, error: null })
                    }
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  className={`${btnPrimary} flex-1`}
                  onClick={() => saveOne(r.id)}
                  disabled={!r.dirty || r.saving}
                >
                  {r.saving ? "Opslaan…" : "Opslaan"}
                </button>
                <button
                  className={btnSoft}
                  onClick={() => setRow(r.id, { dirty: false, error: null })}
                  disabled={r.saving}
                >
                  Reset
                </button>
              </div>
            </article>
          ))
        )}

        {/* mobile pagination */}
        <div className={`${panel} p-4 flex items-center justify-between`}>
          <button
            className={btnSoft}
            disabled={safePage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Vorige
          </button>
          <div className="text-xs opacity-70">
            {safePage} / {totalPages}
          </div>
          <button
            className={btnSoft}
            disabled={safePage === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Volgende
          </button>
        </div>

        {/* sticky save bar */}
        <div className="sticky bottom-3">
          <div className={`${panel} p-3 flex items-center gap-2`}>
            <div className="text-xs opacity-80">
              {dirtyCount} wijziging{dirtyCount === 1 ? "" : "en"}
            </div>
            <button className={`${btnPrimary} ml-auto`} onClick={saveAll} disabled={dirtyCount === 0}>
              Alles opslaan
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}