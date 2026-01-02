import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ClickEventType = "whatsapp" | "route" | "call" | "website";

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
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

// user (optioneel)
const {
  data: { user },
} = await supabase.auth.getUser();

// headers
const userAgent = req.headers.get("user-agent");
const sessionId: string | null =
  req.headers.get("x-session-id") ??
  req.headers.get("x-vercel-id") ??
  null;

    const payload = {
  business_id: businessId,
  event_type: eventType,
  path: path ?? null,
  lang: lang ?? null,
  island: island ?? null,
  user_id: user?.id ?? null,
  session_id: sessionId,
  user_agent: userAgent,
};

const { data, error } = await supabase
  .from("business_click_events")
  .insert(payload)
  .select("id")
  .single();

if (error) {
  console.error("[track/click] INSERT ERROR", {
    message: error.message,
    details: (error as any).details,
    hint: (error as any).hint,
    code: (error as any).code,
    payload,
  });
} else {
  console.log("[track/click] INSERT OK", data);
}

    // tracking mag nooit UX blokkeren
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[track/click]", err);
    return NextResponse.json({ ok: true });
  }
}