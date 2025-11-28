"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";

import { supabaseBrowser } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { langHref } from "@/lib/lang-href";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  lang: string;
};

type AdminListing = {
  id: string;
  business_name: string;
  island: string;
  status: string | null;
  subscription_plan: string | null;
  created_at: string;
  category_name: string | null;
  owner_email: string | null;
};

type Filter = "pending" | "active" | "inactive" | "all";

export default function AdminBusinessesClient({ lang }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);
  const { toast } = useToast();

  const [loadingUser, setLoadingUser] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [filter, setFilter] = useState<Filter>("pending");

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  // 1) Auth + admin check
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const email = data?.user?.email ?? null;

      if (!email) {
        router.replace(langHref(lang, "/business/auth"));
        return;
      }

      if (!adminEmail || email.toLowerCase() !== adminEmail.toLowerCase()) {
        toast({
          variant: "destructive",
          title: "Geen toegang",
          description: "Je hebt geen admin-rechten voor deze pagina.",
        });
        router.replace(langHref(lang, "/"));
        return;
      }

      setIsAdmin(true);
      setLoadingUser(false);
    })();
  }, [adminEmail, lang, router, supabase, toast]);

  // 2) Data ophalen
  useEffect(() => {
    if (!isAdmin) return;

    let alive = true;

    (async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("business_listings")
          .select(
            `
            id,
            business_name,
            island,
            status,
            subscription_plan,
            created_at,
            owner_email,
            categories:category_id (
              name
            )
          `
          )
          .order("created_at", { ascending: false });

        if (error) throw new Error(error.message);
        if (!alive) return;

        const mapped: AdminListing[] =
          (data ?? []).map((row: any) => ({
            id: row.id,
            business_name: row.business_name,
            island: row.island,
            status: row.status,
            subscription_plan: row.subscription_plan,
            created_at: row.created_at,
            category_name: row.categories?.name ?? null,
            owner_email: row.owner_email ?? null,
          })) ?? [];

        setListings(mapped);
      } catch (e: any) {
        toast({
          variant: "destructive",
          title: "Fout bij laden",
          description: e?.message ?? "Kon listings niet ophalen.",
        });
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [isAdmin, supabase, toast]);

  async function updateStatus(id: string, status: "active" | "inactive") {
    try {
      setUpdatingId(id);
      const { error } = await supabase
        .from("business_listings")
        .update({ status })
        .eq("id", id);

      if (error) throw new Error(error.message);

      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status } : l))
      );

      toast({
        title: status === "active" ? "Goedgekeurd" : "Inactief gezet",
        description:
          status === "active"
            ? "De bedrijfsvermelding is nu zichtbaar als actief."
            : "De bedrijfsvermelding is gemarkeerd als inactief.",
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Fout",
        description:
          e?.message ??
          "Kon de status niet bijwerken. Controleer Supabase of RLS.",
      });
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = listings.filter((l) => {
    if (filter === "all") return true;
    return (l.status ?? "pending") === filter;
  });

  if (loadingUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-[#00bfd3]" />
            Admin – Bedrijfsvermeldingen
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Keur nieuwe bedrijven goed of zet ze inactief. Status “pending”
            wordt nog niet getoond als actief.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => router.push(langHref(lang, "/business/dashboard"))}
        >
          Naar dashboard
        </Button>
      </div>

      <Card className="shadow-card">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <CardTitle className="text-base md:text-lg">
            Bedrijven overzicht
          </CardTitle>

          <div className="inline-flex items-center gap-2 text-xs md:text-sm">
            <span className="text-muted-foreground">Filter:</span>
            <div className="inline-flex gap-1">
              {(["pending", "active", "inactive", "all"] as Filter[]).map(
                (f) => (
                  <Button
                    key={f}
                    size="sm"
                    variant={filter === f ? "primaryGrad" : "outlineSoft"}
                    onClick={() => setFilter(f)}
                  >
                    {f === "pending"
                      ? "Pending"
                      : f === "active"
                      ? "Actief"
                      : f === "inactive"
                      ? "Inactief"
                      : "Alle"}
                  </Button>
                )
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="py-8 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Geen bedrijven gevonden voor deze filter.
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((l) => (
                <div
                  key={l.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-border rounded-lg p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">
                        {l.business_name}
                      </span>
                      <Badge variant="secondary" className="capitalize">
                        {l.island || "–"}
                      </Badge>
                      {l.category_name && (
                        <Badge variant="outline">{l.category_name}</Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        Plan: {l.subscription_plan || "starter (default?)"}
                      </span>
                      <span>•</span>
                      <span>
                        Status:{" "}
                        <span className="capitalize">
                          {l.status ?? "pending"}
                        </span>
                      </span>
                      {l.owner_email && (
                        <>
                          <span>•</span>
                          <span>{l.owner_email}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updatingId === l.id}
                      onClick={() => updateStatus(l.id, "inactive")}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Inactief
                    </Button>
                    <Button
                      size="sm"
                      variant="primaryGrad"
                      disabled={updatingId === l.id}
                      onClick={() => updateStatus(l.id, "active")}
                    >
                      {updatingId === l.id ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                      )}
                      Activeer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}