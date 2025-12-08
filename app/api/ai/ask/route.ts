// app/api/ai/ask/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const s = await supabaseServer();
  const { data: { user } } = await s.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const question: string = body?.question ?? "";
  const island: string | null = body?.island ?? null;

  if (!question.trim()) {
    return NextResponse.json({ error: "Question is required" }, { status: 400 });
  }

  // 1) Profiel ophalen
  const { data: profile, error: profileError } = await s
    .from("profiles")
    .select("plan, ai_daily_quota, ai_used_today, ai_last_reset")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile missing" }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10);
  let usedToday = profile.ai_used_today ?? 0;
  let quota = profile.ai_daily_quota ?? 5;

  // 2) Reset quota als het een nieuwe dag is
  if (profile.ai_last_reset !== today) {
    usedToday = 0;
  }

  const isPremium = profile.plan === "premium";

  // Premium mag bijvoorbeeld 50 per dag
  if (isPremium && quota < 50) {
    quota = 50;
  }

  if (usedToday >= quota) {
    return NextResponse.json(
      {
        error: "quota_exceeded",
        message:
          profile.plan === "premium"
            ? "Je hebt je AI-limiet voor vandaag bereikt."
            : "Je hebt je gratis AI-limiet voor vandaag bereikt. Upgrade naar premium voor meer vragen.",
      },
      { status: 429 }
    );
  }

  // 3) Roep hier OpenAI / jouw AI-functie aan
  // const answer = await callYourAI(question, island, profile.plan);
  const answer = `Pseudo-antwoord op: ${question}`;

  // 4) usage updaten + loggen
  await s
    .from("profiles")
    .update({
      ai_used_today: usedToday + 1,
      ai_last_reset: today,
    })
    .eq("id", user.id);

  await s.from("ai_questions").insert({
    user_id: user.id,
    question,
    answer,
    island,
    plan_at_time: profile.plan,
  });

  return NextResponse.json({ answer, plan: profile.plan });
}