// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/* ───────── i18n ───────── */
const LOCALES = ["en", "nl", "pap", "es"] as const;
type Locale = (typeof LOCALES)[number];
const DEFAULT_LOCALE: Locale = "en";

const isLocale = (v: string | null | undefined): v is Locale =>
  !!v && (LOCALES as readonly string[]).includes(v as any);

const getLangFromPath = (pathname: string): Locale | null => {
  const seg = pathname.split("/").filter(Boolean)[0] ?? null;
  return isLocale(seg) ? seg : null;
};

const guessFromAcceptLanguage = (accept: string | null): Locale => {
  const a = (accept ?? "").toLowerCase();
  if (a.startsWith("nl")) return "nl";
  if (a.startsWith("es")) return "es";
  if (a.includes("pap")) return "pap";
  return DEFAULT_LOCALE;
};

/* ─────── Guards/paths ─────── */
const AUTH_CALLBACK_PATHS = [
  "/auth/callback", // Supabase PKCE / magic link / recovery
  "/auth/confirm",
  "/auth/oauth/callback",
];

const PUBLIC_AUTH_PAGES = [
  "/business/auth",
  "/business/forgot-password",
  "/business/reset-password",
];

const PROTECTED_PREFIXES = ["/dashboard", "/business"]; // requires login (and possibly admin)
const ADMIN_PREFIX = "/admin"; // admin only
const ALWAYS_PUBLIC_PREFIXES = ["/biz"]; // mini-sites (taalloos & publiek)

const isAssetOrApi = (p: string) =>
  p.startsWith("/_next") ||
  p.startsWith("/api") ||
  p.startsWith("/assets") ||
  p.startsWith("/images") ||
  p === "/favicon.ico" ||
  p === "/manifest.webmanifest" ||
  p === "/robots.txt" ||
  p === "/sitemap.xml" ||
  /\.[\w]+$/.test(p);

const stripLang = (pathname: string) => {
  const parts = pathname.split("/");
  const first = parts[1];
  if (isLocale(first as any)) {
    const rest = parts.slice(2).join("/");
    return "/" + rest.replace(/^\/+/, "");
  }
  return pathname;
};

const pathStartsWithAny = (path: string, prefixes: string[]) =>
  prefixes.some((p) => path === p || path.startsWith(p + "/"));

/* ───────── Middleware ───────── */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const search = req.nextUrl.search || "";

  // 0) Always allow: auth callbacks, preflight, static assets/API
  if (
    AUTH_CALLBACK_PATHS.some(
      (p) => pathname === p || pathname.startsWith(p + "/")
    )
  ) {
    return NextResponse.next();
  }
  if (req.method === "OPTIONS" || req.method === "HEAD" || isAssetOrApi(pathname)) {
    return NextResponse.next();
  }

  // 1) Enforce language prefix (not for /biz since it's excluded in the matcher)
  let lang = getLangFromPath(pathname);
  if (!lang) {
    const guess = guessFromAcceptLanguage(req.headers.get("accept-language"));
    const url = req.nextUrl.clone();
    url.pathname = `/${guess}${pathname}`;
    return NextResponse.redirect(url);
  }

  // 2) Work with path without language
  const pathNoLang = stripLang(pathname) || "/";

  // 2a) Always public (avoid loops)
  if (pathStartsWithAny(pathNoLang, ALWAYS_PUBLIC_PREFIXES)) {
    return NextResponse.next();
  }
  if (pathStartsWithAny(pathNoLang, PUBLIC_AUTH_PAGES)) {
    return NextResponse.next();
  }

  // 2b) Admin intent?
  const wantsAdmin =
    pathNoLang === ADMIN_PREFIX || pathNoLang.startsWith(ADMIN_PREFIX + "/");

  // 3) Needs authentication?
  const needsAuth = wantsAdmin || pathStartsWithAny(pathNoLang, PROTECTED_PREFIXES);
  if (!needsAuth) return NextResponse.next();

  // 4) Supabase SSR client with cookie bridge
  const res = NextResponse.next();
  type CookieSetOptions = Parameters<typeof res.cookies.set>[2];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string): string | undefined {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options?: CookieSetOptions): void {
          res.cookies.set(name, value, options);
        },
        remove(name: string, options?: CookieSetOptions): void {
          res.cookies.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );

  // 5) Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 6) Not logged in → redirect to auth with return path
  if (!user) {
    const url = req.nextUrl.clone();
    url.pathname = `/${lang}/business/auth`;
    url.searchParams.set("redirectedFrom", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  // 7) Admin guard
  if (wantsAdmin) {
    const roles = ((user?.app_metadata as any)?.roles ?? []) as string[];
    const isAdmin = Array.isArray(roles) && roles.includes("admin");
    if (!isAdmin) {
      const url = req.nextUrl.clone();
      url.pathname = `/${lang}`;
      url.searchParams.set("forbidden", "admin");
      return NextResponse.redirect(url);
    }
  }

  // 8) OK
  return res;
}

/* ───────── Matcher ─────────
   Exclude statics, API, auth-callbacks and /biz (taalloos & public). */
export const config = {
  matcher: [
    "/((?!_next|api|auth/callback|auth/confirm|auth/oauth/callback|biz|.*\\..*).*)",
  ],
};