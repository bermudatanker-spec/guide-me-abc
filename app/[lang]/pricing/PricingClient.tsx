"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { useToast } from "@/hooks/use-toast";
import { createCheckoutSessionAction, type Plan } from "./actions";

type Props = {
  lang: Locale;
  businessId: string; // 👈 je moet dit doorgeven (zie stap 3)
};

export default function PricingClient({ lang, businessId }: Props) {
  const { toast } = useToast();
  const [busy, setBusy] = useState<Plan | null>(null);

  async function buy(plan: Plan) {
    setBusy(plan);
    try {
      const res = await createCheckoutSessionAction(lang, plan, businessId);
      if (!res.ok) {
        toast({ title: "Fout", description: res.error, variant: "destructive" });
        return;
      }
      window.location.href = res.url; // Stripe checkout redirect
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      <button className="border rounded px-4 py-2" disabled={!!busy} onClick={() => buy("starter")}>
        {busy === "starter" ? "Even..." : "Starter"}
      </button>

      <button className="border rounded px-4 py-2" disabled={!!busy} onClick={() => buy("growth")}>
        {busy === "growth" ? "Even..." : "Growth"}
      </button>

      <button className="border rounded px-4 py-2" disabled={!!busy} onClick={() => buy("pro")}>
        {busy === "pro" ? "Even..." : "Pro"}
      </button>
    </div>
  );
}