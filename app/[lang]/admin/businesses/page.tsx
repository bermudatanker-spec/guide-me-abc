// app/admin/businesses/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Check, X, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const dynamic = "force-dynamic";

/* --------------------------------------------------------
   Types
-------------------------------------------------------- */
type Row = {
  id: string;
  business_name: string;
  island: "aruba" | "bonaire" | "curacao";
  description: string | null;
  subscription_plan: string | null;
  status: "pending" | "active" | "inactive";
  categories: { name: string; slug: string } | null;
};

type SupabaseClient = ReturnType<typeof supabaseBrowser>;

/* --------------------------------------------------------
   Admin businesses page
-------------------------------------------------------- */
export default function AdminBusinessesPage() {
  const { toast } = useToast();

  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* -------------------- Supabase client aanmaken -------------------- */
  useEffect(() => {
    // Alleen in de browser uitvoeren
    const client = supabaseBrowser();
    setSupabase(client);
  }, []);

  /* -------------------- Data laden -------------------- */
  async function load(client: SupabaseClient) {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await client
        .from("business_listings")
        .select(
          `
          id,
          business_name,
          island,
          description,
          subscription_plan,
          status,
          categories:category_id (name, slug)
        `,
        )
        .order("created_at", { ascending: false })
        .returns<Row[]>();

      if (error) throw error;
      setRows(data ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Kon gegevens niet laden");
    } finally {
      setLoading(false);
    }
  }

  // Eerste load zodra de client er is
  useEffect(() => {
    if (!supabase) return;
    void load(supabase);
  }, [supabase]);

  /* -------------------- Status bijwerken -------------------- */
  async function updateStatus(id: string, status: Row["status"]) {
    if (!supabase) return;

    try {
      setBusyId(id);
      setError(null);

      // 1️⃣ Update de business status
      const { error: updateError } = await supabase
        .from("business_listings")
        .update({ status })
        .eq("id", id);

      if (updateError) throw updateError;

      // 2️⃣ Audit logging
      await supabase.from("audit_business_moderation").insert({
        business_id: id,
        action: status === "active" ? "approve" : "reject",
        detail: { via: "admin-ui" },
      });

      // 3️⃣ Succesmelding
      toast({
        title:
          status === "active"
            ? "Bedrijf goedgekeurd ✅"
            : "Bedrijf afgewezen ❌",
        description: "Actie is geregistreerd in de auditlog.",
      });

      // 4️⃣ Herladen van lijst
      await load(supabase);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Kon status niet bijwerken");
      toast({
        title: "Fout bij actie",
        description: e?.message ?? "Er ging iets mis bij het bijwerken.",
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  }

  /* -------------------- Afgeleide lijsten -------------------- */
  const pending = rows.filter((r) => r.status === "pending");
  const others = rows.filter((r) => r.status !== "pending");

  /* -------------------- Render -------------------- */
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Bedrijven beheren</h1>
          <Button
            variant="outlineSoft"
            onClick={() => supabase && load(supabase)}
            disabled={!supabase || loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Vernieuwen
          </Button>
        </div>

        {/* Error melding */}
        {error && (
          <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading / geen client */}
        {!supabase || loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Pending */}
            <section className="mb-10">
              <h2 className="text-xl font-semibold mb-3">In afwachting</h2>
              {pending.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Geen pending aanvragen.
                </p>
              ) : (
                <div className="space-y-4">
                  {pending.map((r) => (
                    <Card key={r.id}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">
                          {r.business_name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div>
                            <div className="text-sm text-muted-foreground">
                              {r.island} • {r.categories?.name ?? "—"} • Plan:{" "}
                              {r.subscription_plan ?? "starter"}
                            </div>
                            {r.description && (
                              <p className="mt-2 text-sm line-clamp-2">
                                {r.description}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="primaryGrad"
                              size="sm"
                              disabled={busyId === r.id}
                              onClick={() => updateStatus(r.id, "active")}
                            >
                              <Check className="h-4 w-4 mr-1.5" />
                              Goedkeuren
                            </Button>
                            <Button
                              variant="coralGrad"
                              size="sm"
                              disabled={busyId === r.id}
                              onClick={() => updateStatus(r.id, "inactive")}
                            >
                              <X className="h-4 w-4 mr-1.5" />
                              Afwijzen
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Overig */}
            <section>
              <h2 className="text-xl font-semibold mb-3">Overige bedrijven</h2>
              {others.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nog geen andere items.
                </p>
              ) : (
                <div className="space-y-3">
                  {others.map((r) => (
                    <div
                      key={r.id}
                      className="border rounded-lg p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <div className="font-medium">{r.business_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {r.island} • {r.categories?.name ?? "—"}
                        </div>
                      </div>
                      <Badge
                        className="capitalize"
                        variant={r.status === "active" ? "default" : "secondary"}
                      >
                        {r.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}