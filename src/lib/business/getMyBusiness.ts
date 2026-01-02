import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizePlan, type Plan } from "@/lib/plans/capabilities";

export type MyBusiness = {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  plan: Plan;
  island: string | null;
  trial_end: string | null;
};

export async function getMyBusiness(): Promise<{
  userId: string;
  business: MyBusiness | null;
}> {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();

  const user = auth.user;
  if (!user) return { userId: "", business: null };

  const { data, error } = await supabase
    .from("businesses")
    .select("id,user_id,name,slug,plan,island,trial_end")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    // je kan hier later logger toevoegen
    return { userId: user.id, business: null };
  }

  if (!data) return { userId: user.id, business: null };

  return {
    userId: user.id,
    business: {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      slug: data.slug,
      plan: normalizePlan((data as any).plan),
      island: (data as any).island ?? null,
      trial_end: (data as any).trial_end ?? null,
    },
  };
}