import { supabaseAdmin } from "@/lib/supabase/admin";
import AdminBusinessesClient from "./ui/AdminBusinessesClient";
import type { BusinessRow, SubscriptionPlan, SubscriptionStatus } from "./types";

export const dynamic = "force-dynamic";

type DbSub = {
  id: string;
  business_id: string;
  plan: SubscriptionPlan | null;
  status: SubscriptionStatus | null;
};

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params; // ✅ unwrap promise

  const supabase = supabaseAdmin();

  const { data: listings, error: lErr } = await supabase
    .from("business_listings")
    .select("id, business_name, island")
    .order("business_name", { ascending: true });

  if (lErr) throw new Error(lErr.message);

  const ids = (listings ?? []).map((b) => b.id);

  const { data: subs, error: sErr } = ids.length
    ? await supabase
        .from("subscriptions")
        .select("id, business_id, plan, status")
        .in("business_id", ids)
    : { data: [] as DbSub[], error: null as any };

  if (sErr) throw new Error(sErr.message);

  const subMap = new Map<string, DbSub>();
  for (const s of (subs ?? []) as DbSub[]) subMap.set(s.business_id, s);

  const out: BusinessRow[] = (listings ?? []).map((b: any) => {
    const s = subMap.get(b.id) ?? null;
    return {
      id: b.id,
      name: b.business_name ?? "—",
      island: b.island ?? null,
      subscriptions: s
        ? {
            id: s.id,
            business_id: s.business_id,
            plan: (s.plan ?? "free"),
            status: (s.status ?? "inactive"),
          }
        : null,
    };
  });

  return <AdminBusinessesClient lang={lang} businesses={out} />;
}