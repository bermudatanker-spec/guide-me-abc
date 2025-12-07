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
  "/auth/callback",
  "/auth/confirm",
  "/auth/oauth/callback",
];

const PUBLIC_AUTH_PAGES = [
  "/business/auth",
  "/business/forgot-password",
  "/business/reset-password",
];

// routes die login vereisen voor elke ingelogde rol
const PROTECTED_PREFIXES = ["/dashboard", "/business", "/account"];

const ADMIN_PREFIX = "/admin";    // admin + super_admin
const SUPER_PREFIX = "/godmode";  // echte God Mode

const ALWAYS_PUBLIC_PREFIXES = ["/biz"]; // mini-sites, openbaar

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

/* ─────── Role helpers ─────── */

function getRolesFromUser(user: any): string[] {
  const raw = (user?.app_metadata as any)?.roles;
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((r) => String(r).toLowerCase());
  if (typeof raw === "string") return [raw.toLowerCase()];
  return [];
}

function isSuperAdminUser(roles: string[]): boolean {
  const lower = roles.map((r) => r.toLowerCase());
  return lower.includes("super_admin") || lower.includes("superadmin");
}

function isAdminUser(roles: string[]): boolean {
  const lower = roles.map((r) => r.toLowerCase());
  // super_admin mag automatisch ook admin-routes zien
  return (
    lower.includes("admin") ||
    lower.includes("moderator") ||
    lower.includes("super_admin") ||
    lower.includes("superadmin")
  );
}

/* ───────── Middleware ───────── */

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const search = req.nextUrl.search || "";

  // 0) Altijd doorlaten: auth callbacks, preflight, static assets/API
  if (
    AUTH_CALLBACK_PATHS.some(
      (p) => pathname === p || pathname.startsWith(p + "/"),
    )
  ) {
    return NextResponse.next();
  }

  if (
    req.method === "OPTIONS" ||
    req.method === "HEAD" ||
    isAssetOrApi(pathname)
  ) {
    return NextResponse.next();
  }

  // 1) Taalprefix afdwingen
  const maybeLang = getLangFromPath(pathname);
  if (!maybeLang) {
    const guess = guessFromAcceptLanguage(req.headers.get("accept-language"));
    const url = req.nextUrl.clone();
    url.pathname = `/${guess}${pathname}`;
    return NextResponse.redirect(url);
  }
  const lang = maybeLang;

  // 2) Werk verder met path zonder taal
  const pathNoLang = stripLang(pathname) || "/";

  // 2a) Altijd publieke stukken
  if (pathStartsWithAny(pathNoLang, ALWAYS_PUBLIC_PREFIXES)) {
    return NextResponse.next();
  }
  if (pathStartsWithAny(pathNoLang, PUBLIC_AUTH_PAGES)) {
    return NextResponse.next();
  }

  // 2b) Speciale prefixes
  const wantsAdmin =
    pathNoLang === ADMIN_PREFIX || pathNoLang.startsWith(ADMIN_PREFIX + "/");
  const wantsSuper =
    pathNoLang === SUPER_PREFIX || pathNoLang.startsWith(SUPER_PREFIX + "/");

  // 3) Moet deze route ingelogd zijn?
  const needsAuth =
    wantsAdmin ||
    wantsSuper ||
    pathStartsWithAny(pathNoLang, PROTECTED_PREFIXES);

  if (!needsAuth) {
    return NextResponse.next();
  }

  // 4) Supabase SSR client met cookie bridge
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
    },
  );

  // 5) User ophalen
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 6) Niet ingelogd → naar business/auth + redirect terug
  if (!user) {
    const url = req.nextUrl.clone();
    url.pathname = `/${lang}/business/auth`;
    url.searchParams.set("redirectedFrom", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  const roles = getRolesFromUser(user);
  const isSuper = isSuperAdminUser(roles);

  // 7) God Mode guard (/[lang]/godmode)
  if (wantsSuper && !isSuper) {
    const url = req.nextUrl.clone();
    url.pathname = `/${lang}`;
    url.searchParams.set("forbidden", "super");
    return NextResponse.redirect(url);
  }

  // 8) Admin guard (/[lang]/admin) – admin + super_admin
  if (wantsAdmin) {
    const isAdmin = isAdminUser(roles);
    if (!isAdmin) {
      const url = req.nextUrl.clone();
      url.pathname = `/${lang}`;
      url.searchParams.set("forbidden", "admin");
      return NextResponse.redirect(url);
    }
  }

  // 9) Alles OK → request + cookies doorgeven
  return res;
}

/* ───────── Matcher ─────────
   Exclude statics, API, auth-callbacks en /biz (taalloos & public). */
export const config = {
  matcher: [
    "/((?!_next|api|auth/callback|auth/confirm|auth/oauth/callback|biz|.*\\..*).*)",
  ],
};