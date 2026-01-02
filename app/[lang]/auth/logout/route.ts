import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const SUPPORTED_LANGS = new Set(["nl", "en", "pap", "es"]);

export async function GET(req: Request) {
  const url = new URL(req.url);

  // 1) Probeer lang uit pathname te halen: /nl/auth/logout
  const segs = url.pathname.split("/").filter(Boolean);
  const maybeLang = segs[0];
  const pathLang = SUPPORTED_LANGS.has(maybeLang) ? maybeLang : null;

  // 2) Fallback: probeer referer (pagina waar je vandaan komt)
  const referer = req.headers.get("referer");
  let refLang: string | null = null;
  if (referer) {
    try {
      const refUrl = new URL(referer);
      const refSegs = refUrl.pathname.split("/").filter(Boolean);
      const refMaybe = refSegs[0];
      refLang = SUPPORTED_LANGS.has(refMaybe) ? refMaybe : null;
    } catch {
      // ignore
    }
  }

  // 3) Definitieve fallback
  const lang = pathLang ?? refLang ?? "nl";

  // 4) Cookies store (werkt in alle Next varianten)
  const cookieStore = await Promise.resolve(cookies());

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  // 5) Logout
  await supabase.auth.signOut();

  // 6) Redirect (NOOIT undefined)
  return NextResponse.redirect(new URL(`/${lang}`, url.origin));
}