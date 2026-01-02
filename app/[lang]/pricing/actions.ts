"use server";

import Stripe from "stripe";
import { langHref } from "@/lib/lang-href";
import type { Locale } from "@/i18n/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
});

export type Plan = "starter" | "growth" | "pro";

type Ok = { ok: true; url: string };
type Fail = { ok: false; error: string };
export type Result = Ok | Fail;

function fail(error: unknown): Fail {
  return { ok: false, error: error instanceof Error ? error.message : String(error) };
}

function getPriceId(plan: Plan) {
  const map: Record<Plan, string | undefined> = {
    starter: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
    growth: process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID,
    pro: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
  };
  const priceId = map[plan];
  if (!priceId) throw new Error(`Missing price id for plan "${plan}" (env var).`);
  return priceId;
}

export async function createCheckoutSessionAction(
  lang: Locale,
  plan: Plan,
  businessId: string
): Promise<Result> {
  try {
    const sb = await createSupabaseServerClient();
    const { data, error } = await sb.auth.getUser();
    if (error) return fail(error.message);
    if (!data?.user) return fail("Niet ingelogd.");

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) return fail("Missing NEXT_PUBLIC_SITE_URL");

    const priceId = getPriceId(plan);

    const successUrl = `${siteUrl}${langHref(lang, "/business/dashboard")}?checkout=success`;
    const cancelUrl = `${siteUrl}${langHref(lang, "/pricing")}?checkout=cancel`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,

      // 🔥 Belangrijk: webhook leest dit uit
      metadata: {
        user_id: data.user.id,
        business_id: businessId,
        plan,
      },
    });

    if (!session.url) return fail("No session url returned by Stripe.");
    return { ok: true, url: session.url };
  } catch (e) {
    return fail(e);
  }
}