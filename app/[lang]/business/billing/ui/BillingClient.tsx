// app/[lang]/business/billing/ui/BillingClient.tsx
"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type { Locale } from "@/i18n/config";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { PLANS, PLAN_ORDER, type Plan } from "@/lib/plans";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2 } from "lucide-react";
import { createCheckoutSessionAction, type CheckoutMode } from "../actions";

type Props = { lang: Locale };

type SubscriptionRow = {
  business_id: string;
  plan: Plan | null;
  status: string | null;
  paid_until: string | null;
};

export default function BillingClient({ lang }: Props) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<Plan>("starter");
  const [paidUntil, setPaidUntil] = useState<string | null>(null);

  // Eenvoudige: pak eerste business van owner en haal subscription op via business_id
  // (Als je meerdere businesses per account hebt: dan maken we hier later een selector.)
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);

        const { data: userRes, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;
        if (!userRes?.user) throw new Error("Niet ingelogd.");

        // Pak business_id via business_listings (owner_id)
        const { data: listing, error: listingErr } = await supabase
          .from("business_listings")
          .select("business_id")
          .eq("owner_id", userRes.user.id)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (listingErr) throw listingErr;
        const businessId = (listing as any)?.business_id as string | undefined;
        if (!businessId) {
          // Geen business yet: laat UI wel zien, maar zonder “actief plan”
          setCurrentPlan("starter");
          setPaidUntil(null);
          return;
        }

        const { data: sub, error: subErr } = await supabase
          .from("subscriptions")
          .select("business_id, plan, status, paid_until")
          .eq("business_id", businessId)
          .maybeSingle()
          .returns<SubscriptionRow>();

        if (subErr) throw subErr;

        const p = (sub?.plan ?? "starter") as Plan;
        setCurrentPlan(p);
        setPaidUntil(sub?.paid_until ?? null);
      } catch (e: any) {
        if (!alive) return;
        toast({
          title: "Fout",
          description: e?.message ?? "Kon billing niet laden.",
          variant: "destructive",
        });
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [supabase, toast]);

  function startCheckout(plan: Plan) {
    startTransition(async () => {
      const mode: CheckoutMode = "stripe"; // later kan dit ook "mollie" worden
      const res = await createCheckoutSessionAction(lang, plan, mode);

      if (!res?.ok) {
        toast({
          title: "Checkout mislukt",
          description: res?.error ?? "Onbekende fout",
          variant: "destructive",
        });
        return;
      }

      // Redirect naar Stripe checkout (of later Mollie)
      if (res.url) window.location.href = res.url;
    });
  }

  if (loading) {
    return (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
          Business · Billing
        </p>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Pakketten & betaling
        </h1>

        <p className="text-sm text-muted-foreground max-w-2xl">
          Kies een pakket om premium features te activeren (AI-limieten, featured slots, etc.).
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Badge className="capitalize">Huidig: {currentPlan}</Badge>
          {paidUntil ? (
            <Badge variant="secondary">Paid until: {new Date(paidUntil).toLocaleDateString()}</Badge>
          ) : (
            <Badge variant="secondary">Geen betaalperiode actief</Badge>
          )}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {PLAN_ORDER.map((key) => {
          const p = PLANS[key];
          const isCurrent = currentPlan === key;

          return (
            <Card key={p.key} className={isCurrent ? "border-primary/50" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <span>{p.label}</span>
                  {isCurrent ? <Badge>Actief</Badge> : null}
                </CardTitle>
                <CardDescription>
                  <span className="text-2xl font-semibold">
                    {p.priceMonthly}
                  </span>
                  <span className="text-sm text-muted-foreground"> / maand</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    AI limiet: {p.aiDailyLimit}/dag
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Featured slots: {p.featuredSlots}
                  </li>
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      {perk}
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={isCurrent ? "outline" : "hero"}
                  disabled={isPending || isCurrent}
                  onClick={() => startCheckout(p.key)}
                >
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isCurrent ? "Huidig pakket" : `Kies ${p.label}`}
                </Button>

                <p className="text-xs text-muted-foreground">
                  Let op: dit is de billing-flow scaffolding. Stripe webhook koppelen we hierna strak.
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}