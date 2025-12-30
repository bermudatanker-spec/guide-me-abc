import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Zorg dat Next dit niet probeert te prerenderen
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/* -------------------------------------------------------------------------- */
/* Lazy init (voorkomt build errors)                                           */
/* -------------------------------------------------------------------------- */

let stripeSingleton: Stripe | null = null;

function getStripe() {
  if (stripeSingleton) return stripeSingleton;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");

  stripeSingleton = new Stripe(key, {
  });

  return stripeSingleton;
}

function getWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("Missing STRIPE_WEBHOOK_SECRET");
  return secret;
}

function getSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, serviceKey);
}

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Plan = "starter" | "growth" | "pro";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function unixToIsoOrNull(unix?: number | null): string | null {
  if (!unix) return null;
  return new Date(unix * 1000).toISOString();
}

function getPlanFromPriceId(priceId?: string | null): Plan {
  if (!priceId) return "starter";

  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) return "pro";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID) return "growth";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID) return "starter";

  return "starter";
}

function getCustomerId(customer: any): string | null {
  if (!customer) return null;
  if (typeof customer === "string") return customer;
  return customer.id ?? null;
}

/* -------------------------------------------------------------------------- */
/* DB helpers                                                                 */
/* -------------------------------------------------------------------------- */

async function upsertSubscription(
  supabase: SupabaseClient,
  data: {
    business_id: string;
    plan: Plan;
    status: string;
    stripe_customer_id: string | null;
    stripe_subscription_id: string;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    ends_at: string | null;
    paid_until: string | null;
  }
) {
  const { error } = await supabase
    .from("subscriptions")
    .upsert(data, { onConflict: "business_id" });

  if (error) throw new Error(error.message);
}

async function updateSubscriptionByStripeSubId(
  supabase: SupabaseClient,
  stripeSubId: string,
  patch: Partial<{
    plan: Plan;
    status: string;
    stripe_customer_id: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    ends_at: string | null;
    paid_until: string | null;
  }>
) {
  const { error } = await supabase
    .from("subscriptions")
    .update(patch)
    .eq("stripe_subscription_id", stripeSubId);

  if (error) throw new Error(error.message);
}

/* -------------------------------------------------------------------------- */
/* Webhook                                                                    */
/* -------------------------------------------------------------------------- */

export async function POST(req: Request) {
  try {
    const sig = req.headers.get("stripe-signature");
    if (!sig) {
      return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
    }

    const rawBody = await req.text();

    const stripe = getStripe();
    const webhookSecret = getWebhookSecret();
    const supabase = getSupabase();

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: any) {
      return NextResponse.json(
        { error: `Webhook signature failed: ${err?.message ?? "unknown"}` },
        { status: 400 }
      );
    }

    switch (event.type) {
      /* ------------------------- checkout complete ------------------------- */
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode !== "subscription") {
          return NextResponse.json({ received: true });
        }

        const businessId =
          session.metadata?.business_id?.trim() ||
          String(session.client_reference_id ?? "").trim();

        if (!businessId) {
          // Niet laten falen: Stripe stopt anders met retries
          return NextResponse.json({ received: true });
        }

        const subscriptionId = session.subscription as string;
        const sub = await stripe.subscriptions.retrieve(subscriptionId);

        // Pak velden via any -> geen TS gezeur, altijd werkend
        const s: any = sub;
        const priceId = s?.items?.data?.[0]?.price?.id ?? null;

        await upsertSubscription(supabase, {
          business_id: businessId,
          plan: getPlanFromPriceId(priceId),
          status: String(s?.status ?? "active"),
          stripe_customer_id: getCustomerId(s?.customer),
          stripe_subscription_id: String(s?.id),
          current_period_end: unixToIsoOrNull(s?.current_period_end ?? null),
          cancel_at_period_end: Boolean(s?.cancel_at_period_end ?? false),
          ends_at: null,
          paid_until: null,
        });

        break;
      }

      /* ---------------------- subscription updated ------------------------ */
      case "customer.subscription.updated": {
        const s: any = event.data.object; // <-- hier zit je TS probleem: we fixen het hard

        const priceId = s?.items?.data?.[0]?.price?.id ?? null;

        await updateSubscriptionByStripeSubId(supabase, String(s?.id), {
          plan: getPlanFromPriceId(priceId),
          status: String(s?.status ?? "active"),
          stripe_customer_id: getCustomerId(s?.customer),
          current_period_end: unixToIsoOrNull(s?.current_period_end ?? null),
          cancel_at_period_end: Boolean(s?.cancel_at_period_end ?? false),
        });

        break;
      }

      /* ---------------------- subscription deleted ------------------------ */
      case "customer.subscription.deleted": {
        const s: any = event.data.object;

        const endedAt =
          unixToIsoOrNull(s?.ended_at ?? null) ??
          unixToIsoOrNull(Math.floor(Date.now() / 1000));

        await updateSubscriptionByStripeSubId(supabase, String(s?.id), {
          status: "canceled",
          ends_at: endedAt,
          paid_until: endedAt,
          cancel_at_period_end: false,
        });

        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    // 500 = Stripe gaat retryen. Dit wil je alleen bij echte fouten.
    return NextResponse.json({ error: err?.message ?? "Webhook error" }, { status: 500 });
  }
}