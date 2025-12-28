import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

type ClickEventType = "whatsapp" | "route" | "call" | "website";

type TrackClickBody = {
  businessId: string;
  eventType: ClickEventType;
  path?: string;
  lang?: string;
  island?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TrackClickBody;

    const { businessId, eventType, path, lang, island } = body;

    if (!businessId || !eventType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await supabaseServer();

    // User (optioneel)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Headers
    const userAgent = req.headers.get("user-agent");
    const sessionId =
      req.headers.get("x-session-id") ??
      req.headers.get("x-vercel-id") ??
      null;

    await supabase.from("business_click_events").insert({
      business_id: businessId,
      event_type: eventType,
      path: path ?? null,
      lang: lang ?? null,
      island: island ?? null,
      user_id: user?.id ?? null,
      session_id: sessionId,
      user_agent: userAgent,
    });

    // ⚠️ tracking mag nooit UX blokkeren
    return NextResponse.json({ ok: true });
  } catch (err) {
    // Fail silently (log alleen server-side)
    console.error("[track/click]", err);
    return NextResponse.json({ ok: true });
  }
}