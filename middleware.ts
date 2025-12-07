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

  const isMaintenancePage =
    pathNoLang === "/maintenance" ||
    pathNoLang.startsWith("/maintenance/");

  // 2a) Publieke stukken: mini-sites, auth, maintenance-page zelf
  const isPublicPath =
    pathStartsWithAny(pathNoLang, ALWAYS_PUBLIC_PREFIXES) ||
    pathStartsWithAny(pathNoLang, PUBLIC_AUTH_PAGES) ||
    isMaintenancePage;

  // 3) Supabase SSR client met cookie bridge
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

  // 4) User + rollen
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const roles = getRolesFromUser(user);
  const isSuper = isSuperAdminUser(roles);
  const isAdmin = isAdminUser(roles);

  // 5) Maintenance-mode uit platform_settings
  let maintenanceOn = false;
  try {
    const { data, error } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "maintenance_mode")
      .maybeSingle();

    if (!error) {
      const raw = (data as any)?.value;
      maintenanceOn =
        raw === true ||
        raw === "true" ||
        raw === 1 ||
        raw === "1";
    }
  } catch (err) {
    console.error("[middleware] error loading platform_settings", err);
    maintenanceOn = false;
  }

  // 6) Maintenance guard:
  //    - super_admin mag ALTIJD door (ook naar frontend)
  //    - maintenance-page zelf mag altijd
    // 6) Maintenance guard:
  //    - super_admin mag ALTIJD door (ook naar frontend)
  //    - maintenance-page zelf mag altijd
  //    - optionele geheime bypass via query + cookie
  const bypassToken = process.env.MAINTENANCE_BYPASS_TOKEN;
  const urlToken = req.nextUrl.searchParams.get("bypass_maint");
  const hasQueryBypass = !!bypassToken && urlToken === bypassToken;
  const hasCookieBypass =
    !!bypassToken &&
    req.cookies.get("gmabc_maint_bypass")?.value === bypassToken;

  // Als we via query een geldig token zien, zet een cookie zodat je
  // niet bij elke klik ?bypass_maint=... hoeft mee te sturen
  if (hasQueryBypass && bypassToken) {
    res.cookies.set("gmabc_maint_bypass", bypassToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
  }

  const bypassMaintenance = hasQueryBypass || hasCookieBypass;

  if (maintenanceOn && !isSuper && !isMaintenancePage && !bypassMaintenance) {
    const url = req.nextUrl.clone();
    url.pathname = `/${lang}/maintenance`;
    url.searchParams.delete("forbidden");
    url.searchParams.delete("redirectedFrom");
    return NextResponse.redirect(url);
  }

  // 7) Als route echt publiek is: laat door
  if (isPublicPath) {
    return res;
  }

  // 8) Speciale prefixes (admin / godmode)
  const wantsAdmin =
    pathNoLang === ADMIN_PREFIX || pathNoLang.startsWith(ADMIN_PREFIX + "/");
  const wantsSuper =
    pathNoLang === SUPER_PREFIX || pathNoLang.startsWith(SUPER_PREFIX + "/");

  // 9) Moet ingelogd zijn?
  const needsAuth =
    wantsAdmin ||
    wantsSuper ||
    pathStartsWithAny(pathNoLang, PROTECTED_PREFIXES);

  // 10) Niet ingelogd → naar business/auth + redirect
  if (needsAuth && !user) {
    const url = req.nextUrl.clone();
    url.pathname = `/${lang}/business/auth`;
    url.searchParams.set("redirectedFrom", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  // 11) God Mode guard – alleen super_admin
  if (wantsSuper && !isSuper) {
    const url = req.nextUrl.clone();
    url.pathname = `/${lang}`;
    url.searchParams.set("forbidden", "super");
    return NextResponse.redirect(url);
  }

  // 12) Admin guard – admin + super_admin
  if (wantsAdmin && !isAdmin) {
    const url = req.nextUrl.clone();
    url.pathname = `/${lang}`;
    url.searchParams.set("forbidden", "admin");
    return NextResponse.redirect(url);
  }

  // 13) Alles ok
  return res;
}

/* ───────── Matcher ───────── */
export const config = {
  matcher: [
    "/((?!_next|api|auth/callback|auth/confirm|auth/oauth/callback|biz|.*\\..*).*)",
  ],
};