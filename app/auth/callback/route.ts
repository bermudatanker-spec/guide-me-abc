// app/auth/callback/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isLocale, type Locale } from "@/i18n/config";

/**
 * GET /auth/callback?code=...&lang=nl&redirectedFrom=/nl/business/dashboard
 * Wordt gebruikt voor magic link / OAuth / PKCE.
 */
export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);

  const code = requestUrl.searchParams.get("code");

  // 1) Taal ophalen & veilig maken
  const langParam = requestUrl.searchParams.get("lang") || "nl";
  const lang: Locale = isLocale(langParam) ? langParam : "nl";

  // 2) Waarheen redirecten na succesvolle login?
  const redirectedFrom =
    requestUrl.searchParams.get("redirectedFrom") ||
    `/${lang}/business/dashboard`;

  // Zonder code? Gewoon naar home van die taal.
  if (!code) {
    return NextResponse.redirect(new URL(`/${lang}`, req.url));
  }

  // 3) Response die we kunnen vullen met cookies
  const res = NextResponse.redirect(new URL(redirectedFrom, req.url));

  type CookieSetOptions = Parameters<(typeof res.cookies)["set"]>[2];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
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

  // 4) Code -> Supabase sessie (zet auth cookies)
  await supabase.auth.exchangeCodeForSession(code);

  // 5) Klaar
  return res;
}