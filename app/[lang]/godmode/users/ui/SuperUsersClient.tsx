"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Shield, UserCircle2, BriefcaseBusiness, Ban } from "lucide-react";

type Props = { lang: Locale };

type DbUserRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  roles: string[];
  is_blocked: boolean;
  created_at: string | null;
  last_sign_in_at: string | null;
  business_name: string | null;
};

const ROLE_SUPER = "super_admin";
const ROLE_ADMIN = "admin";
const ROLE_BUSINESS = "business_owner";

/* -------- helpers -------- */

function normalizeRoles(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((r) => String(r).toLowerCase()).filter(Boolean);
  if (typeof raw === "string") return [raw.toLowerCase()];
  return [];
}

function isSuperAdmin(u: Pick<DbUserRow, "roles">): boolean {
  const r = normalizeRoles(u.roles);
  return r.includes(ROLE_SUPER) || r.includes("superadmin");
}
function isAdmin(u: Pick<DbUserRow, "roles">): boolean {
  const r = normalizeRoles(u.roles);
  return r.includes(ROLE_ADMIN) || r.includes("moderator") || r.includes(ROLE_SUPER);
}
function isBusinessOwner(u: Pick<DbUserRow, "roles">): boolean {
  const r = normalizeRoles(u.roles);
  return r.includes(ROLE_BUSINESS);
}

const roleBadges = (u: DbUserRow, isNl: boolean) => {
  const list: React.ReactNode[] = [];

  if (isSuperAdmin(u)) {
    list.push(
      <Badge key="super" variant="default" className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-sm">
        <Shield className="mr-1 h-3 w-3" />
        {isNl ? "Super admin" : "Super admin"}
      </Badge>
    );
  } else if (isAdmin(u)) {
    list.push(
      <Badge key="admin" variant="outline" className="border-sky-500/60 text-sky-700 bg-sky-50">
        <Shield className="mr-1 h-3 w-3" />
        {isNl ? "Admin" : "Admin"}
      </Badge>
    );
  }

  if (isBusinessOwner(u)) {
    list.push(
      <Badge key="business" variant="outline" className="border-emerald-500/60 text-emerald-700 bg-emerald-50">
        <BriefcaseBusiness className="mr-1 h-3 w-3" />
        {isNl ? "Ondernemer" : "Business owner"}
      </Badge>
    );
  }

  if (u.is_blocked) {
    list.push(
      <Badge key="blocked" variant="destructive" className="bg-red-600 text-white">
        <Ban className="mr-1 h-3 w-3" />
        {isNl ? "Geblokkeerd" : "Blocked"}
      </Badge>
    );
  }

  if (!list.length) {
    list.push(
      <Badge key="user" variant="outline" className="border-slate-300 text-slate-700 bg-slate-50">
        <UserCircle2 className="mr-1 h-3 w-3" />
        {isNl ? "Gebruiker" : "User"}
      </Badge>
    );
  }

  return <div className="mt-1 flex flex-wrap gap-1.5">{list}</div>;
};

/* -------- API helpers -------- */

async function apiGetUsers(): Promise<DbUserRow[]> {
  const res = await fetch("/api/godmode/users", { method: "GET", cache: "no-store", credentials: "include" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok) throw new Error(json?.error ?? "Failed to load users");

  return (json.users ?? []).map((u: any) => ({
    id: u.id,
    email: u.email ?? null,
    full_name: u.full_name ?? null,
    roles: normalizeRoles(u.roles),
    is_blocked: !!u.is_blocked,
    created_at: u.created_at ?? null,
    last_sign_in_at: u.last_sign_in_at ?? null,
    business_name: u.business_name ?? null,
  }));
}

async function apiToggleRole(userId: string, role: string) {
  const res = await fetch("/api/godmode/users/toggle-role", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ userId, role }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok) throw new Error(json?.error ?? "Could not update role");
  return json as { ok: true; userId: string; roles: string[] };
}

async function apiToggleBlocked(userId: string) {
  const res = await fetch("/api/godmode/users/toggle-blocked", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ userId }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok) throw new Error(json?.error ?? "Could not update status");
  return json as { ok: true; userId: string; is_blocked: boolean };
}

export default function SuperUsersClient({ lang }: Props) {
  const isNl = lang === "nl";
  const { toast } = useToast();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<DbUserRow[]>([]);
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentIsSuper, setCurrentIsSuper] = useState(false);

  // 1) current user
  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      const { data, error } = await supabase.auth.getUser();
      if (cancelled || error || !data?.user) return;

      setCurrentUserId(data.user.id);

      const roles = normalizeRoles(data.user.app_metadata?.roles);
      setCurrentIsSuper(roles.includes(ROLE_SUPER) || roles.includes("superadmin"));
    }

    loadCurrentUser();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  // 2) load users from API
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const users = await apiGetUsers();
        if (!cancelled) setRows(users);
      } catch (err: any) {
        console.error("[GodMode/users] load error", err);
        toast({
          title: isNl ? "Fout bij laden" : "Failed to load users",
          description: err?.message ?? "Unknown error",
          variant: "destructive",
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isNl, toast]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;

    return rows.filter((u) => {
      const name = (u.full_name ?? "").toLowerCase();
      const mail = (u.email ?? "").toLowerCase();
      const biz = (u.business_name ?? "").toLowerCase();
      return name.includes(term) || mail.includes(term) || biz.includes(term);
    });
  }, [rows, search]);

  function patchRolesLocal(userId: string, nextRoles: string[]) {
    setRows((prev) => prev.map((row) => (row.id === userId ? { ...row, roles: normalizeRoles(nextRoles) } : row)));
  }

  async function toggleRole(u: DbUserRow, role: string) {
    if (!u.id) return;

    const isSelf = currentUserId === u.id;
    if (role === ROLE_SUPER && isSelf) return;

    setLoadingId(u.id);
    try {
      const out = await apiToggleRole(u.id, role);
      patchRolesLocal(u.id, out.roles);
      toast({ title: isNl ? "Rol bijgewerkt" : "Role updated" });
    } catch (err: any) {
      console.error("[GodMode/users] toggleRole error", err);
      toast({
        title: isNl ? "Kon rol niet aanpassen" : "Could not update role",
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setLoadingId(null);
    }
  }

  async function toggleBlocked(u: DbUserRow) {
    if (!u.id) return;

    setLoadingId(u.id);
    try {
      const out = await apiToggleBlocked(u.id);
      setRows((prev) => prev.map((row) => (row.id === u.id ? { ...row, is_blocked: out.is_blocked } : row)));
      toast({ title: isNl ? "Status bijgewerkt" : "Status updated" });
    } catch (err: any) {
      console.error("[GodMode/users] toggleBlocked error", err);
      toast({
        title: isNl ? "Kon status niet aanpassen" : "Could not update status",
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setLoadingId(null);
    }
  }

  if (loading) {
    return (
      <main className="container mx-auto flex min-h-dvh items-center justify-center px-4 pt-24 pb-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="container mx-auto space-y-6 px-4 pt-24 pb-20 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {isNl ? "GodMode – Gebruikersbeheer" : "GodMode – User management"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isNl
              ? "Bekijk alle accounts, pas rollen aan en blokkeer of activeer gebruikers."
              : "View all accounts, adjust roles and block or activate users."}
          </p>
        </div>

        <div className="w-full md:w-72">
          <Input
            placeholder={isNl ? "Zoek op naam, e-mail of bedrijf…" : "Search by name, email or business…"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10"
          />
        </div>
      </div>

      <Card className="border border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{isNl ? "Alle gebruikers" : "All users"}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          {!filtered.length ? (
            <p className="text-sm text-muted-foreground">{isNl ? "Geen gebruikers gevonden." : "No users found."}</p>
          ) : (
            <div className="divide-y divide-border/70">
              {filtered.map((u, index) => {
                const isLoadingRow = loadingId === u.id;
                const superHere = isSuperAdmin(u);
                const adminHere = isAdmin(u);
                const businessHere = isBusinessOwner(u);
                const isBlocked = u.is_blocked;

                const isSelf = currentUserId === u.id;
                const canToggleSuper = currentIsSuper && !isSelf;

                return (
                  <div
                    key={`${u.id}-${index}`}
                    className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{u.full_name || u.email || "—"}</span>
                        {u.email && <span className="text-xs text-muted-foreground">· {u.email}</span>}
                      </div>

                      {u.business_name && <p className="text-xs text-muted-foreground">{u.business_name}</p>}

                      {roleBadges(u, isNl)}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant={superHere ? "default" : "outline"}
                        disabled={isLoadingRow || !canToggleSuper}
                        onClick={canToggleSuper ? () => toggleRole(u, ROLE_SUPER) : undefined}
                        title={
                          !currentIsSuper
                            ? isNl
                              ? "Alleen super_admin kan dit"
                              : "Only super_admin can do this"
                            : isSelf
                            ? isNl
                              ? "Je kan dit niet op jezelf"
                              : "You can't do this to yourself"
                            : undefined
                        }
                      >
                        {isLoadingRow ? <Loader2 className="h-3 w-3 animate-spin" /> : "super_admin"}
                      </Button>

                      <Button
                        size="sm"
                        variant={adminHere ? "default" : "outline"}
                        disabled={isLoadingRow || superHere}
                        onClick={() => toggleRole(u, ROLE_ADMIN)}
                        title={
                          superHere
                            ? isNl
                              ? "Super admin is altijd admin"
                              : "Super admin is always admin"
                            : undefined
                        }
                      >
                        {isLoadingRow ? <Loader2 className="h-3 w-3 animate-spin" /> : "admin"}
                      </Button>

                      <Button
                        size="sm"
                        variant={businessHere ? "default" : "outline"}
                        disabled={isLoadingRow}
                        onClick={() => toggleRole(u, ROLE_BUSINESS)}
                      >
                        {isLoadingRow ? <Loader2 className="h-3 w-3 animate-spin" /> : "business_owner"}
                      </Button>

                      <Button
                        size="sm"
                        variant={isBlocked ? "destructive" : "outline"}
                        disabled={isLoadingRow || superHere}
                        onClick={() => toggleBlocked(u)}
                        className="mt-0.5"
                        title={
                          superHere
                            ? isNl
                              ? "Super admin kun je niet blokkeren"
                              : "You can't block a super admin"
                            : undefined
                        }
                      >
                        {isLoadingRow ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : isBlocked ? (
                          isNl ? "Deblokkeren" : "Unblock"
                        ) : (
                          isNl ? "Blokkeren" : "Block"
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
