// app/auth/callback/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isLocale } from "@/i18n/config";
import type { Locale } from "@/i18n/config";

function safeInternalPath(value: string | null): string | null {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return null;
  if (!value.startsWith("/")) return null;
  return value;
}

function langFromPath(path: string | null): Locale {
  const seg = (path ?? "").split("/").filter(Boolean)[0] ?? "en";
  return isLocale(seg) ? (seg as Locale) : "en";
}

/**
 * GET /auth/callback?code=...&redirectedFrom=/nl/business/dashboard
 * (lang is optioneel; we leiden het af)
 */
export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);

  const code = requestUrl.searchParams.get("code");
  const redirectedFromRaw = safeInternalPath(
    requestUrl.searchParams.get("redirectedFrom"),
  );

  const langParam: string | null = requestUrl.searchParams.get("lang");

  const lang: Locale = redirectedFromRaw
    ? langFromPath(redirectedFromRaw)
    : isLocale(langParam ?? "")
      ? ((langParam ?? "en") as Locale)
      : "en";

  const fallbackAfterLogin = `/${lang}/business/dashboard`;

  const hasError =
    requestUrl.searchParams.has("error") ||
    requestUrl.searchParams.has("error_code") ||
    requestUrl.searchParams.has("error_description");

  if (hasError || !code) {
    const dest = new URL(req.url);
    dest.pathname = `/${lang}/business/auth`;
    dest.search = "";
    dest.searchParams.set("error", "callback_failed");
    return NextResponse.redirect(dest);
  }

  const res = NextResponse.redirect(
    new URL(redirectedFromRaw ?? fallbackAfterLogin, req.url),
  );

  type CookieSetOptions = Parameters<(typeof res.cookies)["set"]>[2];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseAnon, {
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
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const dest = new URL(req.url);
    dest.pathname = `/${lang}/business/auth`;
    dest.search = "";
    dest.searchParams.set("error", "callback_failed");
    return NextResponse.redirect(dest);
  }

  return res;
}