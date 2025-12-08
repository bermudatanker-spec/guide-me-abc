"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Shield,
  UserCircle2,
  BriefcaseBusiness,
  Ban,
} from "lucide-react";

type Props = {
  lang: Locale;
};

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

/* -------- helpers voor rollen -------- */

function normalizeRoles(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((r) => String(r).toLowerCase());
  if (typeof raw === "string") return [raw.toLowerCase()];
  return [];
}

function hasRole(u: DbUserRow, role: string): boolean {
  return normalizeRoles(u.roles).includes(role);
}

function isSuperAdmin(u: DbUserRow): boolean {
  const r = normalizeRoles(u.roles);
  return r.includes(ROLE_SUPER) || r.includes("superadmin");
}

function isAdmin(u: DbUserRow): boolean {
  const r = normalizeRoles(u.roles);
  return (
    r.includes(ROLE_ADMIN) ||
    r.includes("moderator") ||
    r.includes(ROLE_SUPER)
  );
}

function isBusinessOwner(u: DbUserRow): boolean {
  return normalizeRoles(u.roles).includes(ROLE_BUSINESS);
}

/* -------- UI helpers (badges) -------- */

const roleBadges = (u: DbUserRow, isNl: boolean) => {
  const list: React.ReactNode[] = [];

  if (isSuperAdmin(u)) {
    list.push(
      <Badge
        key="super"
        variant="default"
        className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-sm"
      >
        <Shield className="mr-1 h-3 w-3" />
        {isNl ? "Super admin" : "Super admin"}
      </Badge>,
    );
  } else if (isAdmin(u)) {
    list.push(
      <Badge
        key="admin"
        variant="outline"
        className="border-sky-500/60 text-sky-700 bg-sky-50"
      >
        <Shield className="mr-1 h-3 w-3" />
        {isNl ? "Admin" : "Admin"}
      </Badge>,
    );
  }

  if (isBusinessOwner(u)) {
    list.push(
      <Badge
        key="business"
        variant="outline"
        className="border-emerald-500/60 text-emerald-700 bg-emerald-50"
      >
        <BriefcaseBusiness className="mr-1 h-3 w-3" />
        {isNl ? "Ondernemer" : "Business owner"}
      </Badge>,
    );
  }

  if (u.is_blocked) {
    list.push(
      <Badge
        key="blocked"
        variant="destructive"
        className="bg-red-600 text-white"
      >
        <Ban className="mr-1 h-3 w-3" />
        {isNl ? "Geblokkeerd" : "Blocked"}
      </Badge>,
    );
  }

  if (!list.length) {
    list.push(
      <Badge
        key="user"
        variant="outline"
        className="border-slate-300 text-slate-700 bg-slate-50"
      >
        <UserCircle2 className="mr-1 h-3 w-3" />
        {isNl ? "Gebruiker" : "User"}
      </Badge>,
    );
  }

  return <div className="mt-1 flex flex-wrap gap-1.5">{list}</div>;
};

/* ================= Component ================= */

export default function SuperUsersClient({ lang }: Props) {
  const isNl = lang === "nl";
  const { toast } = useToast();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<DbUserRow[]>([]);
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // huidige ingelogde gebruiker (voor rechten)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentIsSuper, setCurrentIsSuper] = useState(false);

  // 1) Haal huidige gebruiker op om te weten of we super_admin zijn
  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      const { data, error } = await supabase.auth.getUser();
      if (cancelled || error || !data?.user) return;

      setCurrentUserId(data.user.id);

      const meta: any = data.user.app_metadata ?? {};
      const roles = normalizeRoles(meta.roles);
      setCurrentIsSuper(
        roles.includes(ROLE_SUPER) || roles.includes("superadmin"),
      );
    }

    void loadCurrentUser();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  // 2) Haal alle users op
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_all_users_with_roles");

      if (cancelled) return;

      if (error) {
        console.error("[GodMode/users] load error", error);
        toast({
          title: isNl ? "Fout bij laden" : "Failed to load users",
          description:
            error.message ??
            (isNl
              ? "Kon gebruikerslijst niet ophalen."
              : "Could not fetch user list."),
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      setRows((data ?? []) as DbUserRow[]);
      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [isNl, supabase, toast]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;

    return rows.filter((u) => {
      const name = (u.full_name ?? "").toLowerCase();
      const mail = (u.email ?? "").toLowerCase();
      const biz = (u.business_name ?? "").toLowerCase();
      return (
        name.includes(term) ||
        mail.includes(term) ||
        biz.includes(term)
      );
    });
  }, [rows, search]);

  async function toggleRole(u: DbUserRow, role: string) {
    if (!u.id) return;
    setLoadingId(u.id);

    try {
      const { error } = await supabase.rpc("toggle_user_role", {
        p_user_id: u.id,
        p_role: role,
      });

      if (error) throw error;

      setRows((prev) =>
        prev.map((row) =>
          row.id === u.id
            ? {
                ...row,
                // Super admin mag nooit "per ongeluk" kwijtraken
                roles:
                  isSuperAdmin(row) && role === ROLE_SUPER
                    ? row.roles
                    : row.roles.includes(role)
                      ? row.roles.filter((r) => r !== role)
                      : [...row.roles, role],
              }
            : row,
        ),
      );

      toast({
        title: isNl ? "Rol bijgewerkt" : "Role updated",
      });
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
      const { error } = await supabase.rpc("toggle_user_blocked", {
        p_user_id: u.id,
      });
      if (error) throw error;

      setRows((prev) =>
        prev.map((row) =>
          row.id === u.id ? { ...row, is_blocked: !row.is_blocked } : row,
        ),
      );

      toast({
        title: isNl ? "Status bijgewerkt" : "Status updated",
      });
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
            placeholder={
              isNl
                ? "Zoek op naam, e-mail of bedrijf…"
                : "Search by name, email or business…"
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10"
          />
        </div>
      </div>

      <Card className="border border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">
            {isNl ? "Alle gebruikers" : "All users"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {!filtered.length ? (
            <p className="text-sm text-muted-foreground">
              {isNl ? "Geen gebruikers gevonden." : "No users found."}
            </p>
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

                const rowKey = `${u.id}-${index}`;

                return (
                  <div
                    key={rowKey}
                    className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">
                          {u.full_name || u.email || "—"}
                        </span>
                        {u.email && (
                          <span className="text-xs text-muted-foreground">
                            · {u.email}
                          </span>
                        )}
                      </div>
                      {u.business_name && (
                        <p className="text-xs text-muted-foreground">
                          {u.business_name}
                        </p>
                      )}
                      {roleBadges(u, isNl)}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* super_admin toggle (alleen door super_admin, niet op jezelf) */}
                      <Button
                        size="sm"
                        variant={superHere ? "default" : "outline"}
                        disabled={isLoadingRow || !canToggleSuper}
                        onClick={
                          canToggleSuper
                            ? () => toggleRole(u, ROLE_SUPER)
                            : undefined
                        }
                      >
                        {isLoadingRow ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "super_admin"
                        )}
                      </Button>

                      {/* admin toggle */}
                      <Button
                        size="sm"
                        variant={adminHere ? "default" : "outline"}
                        disabled={isLoadingRow || superHere}
                        onClick={() => toggleRole(u, ROLE_ADMIN)}
                      >
                        {isLoadingRow ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "admin"
                        )}
                      </Button>

                      {/* business_owner toggle */}
                      <Button
                        size="sm"
                        variant={businessHere ? "default" : "outline"}
                        disabled={isLoadingRow}
                        onClick={() => toggleRole(u, ROLE_BUSINESS)}
                      >
                        {isLoadingRow ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "business_owner"
                        )}
                      </Button>

                      {/* block / unblock */}
                      <Button
                        size="sm"
                        variant={isBlocked ? "destructive" : "outline"}
                        disabled={isLoadingRow || superHere}
                        onClick={() => toggleBlocked(u)}
                        className="mt-0.5"
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