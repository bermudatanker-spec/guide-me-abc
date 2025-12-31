"use client";

import React from "react";
import { useToast } from "@/components/ui/use-toast";
import type { BusinessRow, SubscriptionPlan, SubscriptionStatus } from "../types";

const PLANS: SubscriptionPlan[] = ["free", "starter", "growth", "pro"];
const STATUSES: SubscriptionStatus[] = ["inactive", "active"];

const SAVE_URL = "/api/admin/businesses/subscription";

type RowState = {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  dirty: boolean;
  saving: boolean;
  error: string | null;
};

type Props = {
  lang: string;
  businesses: BusinessRow[];
};

function normalizePlan(v: unknown): SubscriptionPlan {
  const s = String(v ?? "free").toLowerCase();
  return (PLANS.includes(s as any) ? s : "free") as SubscriptionPlan;
}
function normalizeStatus(v: unknown): SubscriptionStatus {
  const s = String(v ?? "inactive").toLowerCase();
  return (STATUSES.includes(s as any) ? s : "inactive") as SubscriptionStatus;
}

async function readJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export default function AdminBusinessesClient({ businesses }: Props) {
  const { toast } = useToast();

  // ✅ token hoort NIET in process.env in de client
  const [adminToken, setAdminToken] = React.useState<string>("");

  // load token uit sessionStorage (alleen browser)
  React.useEffect(() => {
    const t = sessionStorage.getItem("admin_token") ?? "";
    setAdminToken(t);
  }, []);

  const [query, setQuery] = React.useState("");

  // rows state
  const [rows, setRows] = React.useState<Record<string, RowState>>({});

  // ✅ zorg dat saveOne altijd de nieuwste rows ziet
  const rowsRef = React.useRef(rows);
  React.useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  // ✅ (re)initialiseer rows als businesses verandert
  React.useEffect(() => {
    const initial: Record<string, RowState> = {};
    for (const b of businesses) {
      // support beide varianten
      const sub = (b as any).subscription ?? null;

      initial[b.id] = {
        plan: normalizePlan(sub?.plan),
        status: normalizeStatus(sub?.status),
        dirty: false,
        saving: false,
        error: null,
      };
    }
    setRows(initial);
  }, [businesses]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return businesses;
    return businesses.filter((b) => (b.name ?? "").toLowerCase().includes(q));
  }, [businesses, query]);

  function setPlan(businessId: string, plan: SubscriptionPlan) {
    setRows((r) => ({
      ...r,
      [businessId]: { ...r[businessId], plan, dirty: true, error: null },
    }));
  }

  function setStatus(businessId: string, status: SubscriptionStatus) {
    setRows((r) => ({
      ...r,
      [businessId]: { ...r[businessId], status, dirty: true, error: null },
    }));
  }

  async function saveOne(businessId: string) {
    const row = rowsRef.current[businessId];
    if (!row || row.saving) return;

    setRows((r) => ({
      ...r,
      [businessId]: { ...r[businessId], saving: true, error: null },
    }));

    try {
      const token = adminToken.trim();

      const res = await fetch(SAVE_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(token ? { "x-admin-token": token } : {}),
        },
        body: JSON.stringify({
          businessId,
          plan: row.plan,
          status: row.status,
        }),
      });

      const json = await readJsonSafe(res);

      if (!res.ok) {
        const msg = json?.error ?? `Save failed (${res.status})`;
        throw new Error(msg);
      }

      setRows((r) => ({
        ...r,
        [businessId]: { ...r[businessId], saving: false, dirty: false, error: null },
      }));

      toast({ title: "Opgeslagen", description: "Abonnement bijgewerkt." });
    } catch (e: any) {
      setRows((r) => ({
        ...r,
        [businessId]: {
          ...r[businessId],
          saving: false,
          error: e?.message ?? "Unknown error",
        },
      }));
      toast({
        title: "Fout",
        description: e?.message ?? "Unknown error",
        variant: "destructive",
      });
    }
  }

  async function saveAll() {
    const snapshot = rowsRef.current;
    const dirtyIds = Object.entries(snapshot)
      .filter(([, v]) => v.dirty && !v.saving)
      .map(([id]) => id);

    for (const id of dirtyIds) {
      // sequential is prima
      // eslint-disable-next-line no-await-in-loop
      await saveOne(id);
    }
  }

  const dirtyCount = Object.values(rows).filter((r) => r.dirty).length;

  return (
    <div className="p-6 space-y-4">
      {/* ✅ admin token input */}
      <div className="flex flex-col gap-2 rounded-md border p-3">
        <div className="text-sm font-medium">Admin token</div>
        <div className="flex gap-2">
          <input
            className="w-full rounded-md border px-3 py-2"
            placeholder="Plak je x-admin-token hier (wordt in session opgeslagen)"
            value={adminToken}
            onChange={(e) => {
              const v = e.target.value;
              setAdminToken(v);
              sessionStorage.setItem("admin_token", v);
            }}
          />
          <button
            className="rounded-md border px-3 py-2"
            onClick={() => {
              setAdminToken("");
              sessionStorage.removeItem("admin_token");
              toast({ title: "Token verwijderd" });
            }}
          >
            Clear
          </button>
        </div>
        <div className="text-xs opacity-70">
          Dit token komt bewust niet uit env/NEXT_PUBLIC om leaks te voorkomen.
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <input
          className="w-full max-w-md rounded-md border px-3 py-2"
          placeholder="Zoek op bedrijfsnaam..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="rounded-md border px-3 py-2 disabled:opacity-50"
          onClick={saveAll}
          disabled={dirtyCount === 0}
        >
          Alles opslaan ({dirtyCount})
        </button>
      </div>

      <div className="w-full overflow-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr className="text-left">
              <th className="p-3">Bedrijf</th>
              <th className="p-3">Plan</th>
              <th className="p-3">Status</th>
              <th className="p-3">Acties</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => {
              const row = rows[b.id];
              return (
                <tr key={b.id} className="border-t">
                  <td className="p-3">
                    <div className="font-medium">{b.name}</div>
                    <div className="text-xs opacity-70">{b.island ?? ""}</div>
                    {row?.error ? (
                      <div className="text-xs text-red-600 mt-1">{row.error}</div>
                    ) : null}
                  </td>

                  <td className="p-3">
                    <select
                      className="rounded-md border px-2 py-1"
                      value={row?.plan ?? "free"}
                      onChange={(e) => setPlan(b.id, e.target.value as SubscriptionPlan)}
                    >
                      {PLANS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-3">
                    <select
                      className="rounded-md border px-2 py-1"
                      value={row?.status ?? "inactive"}
                      onChange={(e) => setStatus(b.id, e.target.value as SubscriptionStatus)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-3">
                    <button
                      className="rounded-md border px-3 py-2 disabled:opacity-50"
                      onClick={() => saveOne(b.id)}
                      disabled={!row || row.saving || !row.dirty}
                    >
                      {row?.saving ? "Opslaan..." : "Opslaan"}
                    </button>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 ? (
              <tr>
                <td className="p-6 opacity-70" colSpan={4}>
                  Geen resultaten
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}