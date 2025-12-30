// app/[lang]/business/billing/actions.ts
"use server";

import "server-only";
import type { Locale } from "@/i18n/config";
import { supabaseServer } from "@/lib/supabase/server";
import type { Plan } from "@/lib/plans";

type Ok<T = {}> = { ok: true } & T;
type Fail = { ok: false; error: string };
export type Result<T = {}> = Ok<T> | Fail;

export type CheckoutMode = "stripe" | "mollie";

function ok<T>(data?: T): Ok<T> {
  return { ok: true, ...(data ?? ({} as T)) };
}
function fail(error: unknown): Fail {
  return { ok: false, error: error instanceof Error ? error.message : String(error) };
}

async function requireUserAndBusinessId(): Promise<{ userId: string; businessId: string }> {
  const sb = await supabaseServer();
  const { data, error } = await sb.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data?.user) throw new Error("Niet ingelogd.");

  const userId = data.user.id;

  // Pak business_id van laatste listing van owner
  const { data: listing, error: listingErr } = await sb
    .from("business_listings")
    .select("business_id")
    .eq("owner_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (listingErr) throw new Error(listingErr.message);

  const businessId = (listing as any)?.business_id as string | undefined;
  if (!businessId) throw new Error("Geen business gevonden voor dit account.");

  return { userId, businessId };
}

/**
 * Create checkout session (scaffold).
 * Straks vervangen we dit door echte Stripe/Mollie checkout + webhook.
 */
export async function createCheckoutSessionAction(
  lang: Locale,
  plan: Plan,
  mode: CheckoutMode = "stripe"
): Promise<Result<{ url: string }>> {
  try {
    const { businessId } = await requireUserAndBusinessId();

    // ✅ Placeholder: voor nu redirecten we naar een “success” return url.
    // Straks:
    // - Stripe checkout session maken
    // - metadata: { business_id: businessId, plan }
    // - return session.url
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_VERCEL_URL?.startsWith("http")
        ? process.env.NEXT_PUBLIC_VERCEL_URL
        : process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : "http://localhost:3000";

    const returnUrl = `${baseUrl}/${lang}/business/billing?requested_plan=${plan}&mode=${mode}&business_id=${businessId}`;

    return ok({ url: returnUrl });
  } catch (e) {
    return fail(e);
  }
}