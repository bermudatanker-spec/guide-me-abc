import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * GET /auth/callback?code=...&lang=nl&redirectedFrom=/nl/business/dashboard
 * Wordt door Supabase gebruikt voor magic link / OAuth / PKCE.
 */
export async function GET(req: Request) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");
  const lang = requestUrl.searchParams.get("lang") || "nl";
  const redirectedFrom =
    requestUrl.searchParams.get("redirectedFrom") ||
    `/${lang}/business/dashboard`;

  // Zonder code? Gewoon naar home.
  if (!code) {
    return NextResponse.redirect(new URL(`/${lang}`, req.url));
  }

  // Response die we kunnen “vullen” met cookies
  const res = NextResponse.redirect(new URL(redirectedFrom, req.url));

  // Supabase server client met cookie bridge
  type CookieSetOptions = Parameters<typeof res.cookies.set>[2];
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // cookies uitlezen uit de binnenkomende request
          const cookie = req.headers.get("cookie");
          if (!cookie) return undefined;
          const match = cookie
            .split("; ")
            .find((c) => c.startsWith(name + "="));
          return match?.split("=")[1];
        },
        set(name: string, value: string, options?: CookieSetOptions) {
          res.cookies.set(name, value, options);
        },
        remove(name: string, options?: CookieSetOptions) {
          res.cookies.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );

  // 🔑 Wissel de code in voor een sessie (BELANGRIJK: geef de code mee)
  await supabase.auth.exchangeCodeForSession(code);

  // Klaar: redirect naar gewenste pagina
  return res;
}