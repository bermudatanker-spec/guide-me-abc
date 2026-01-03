// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
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

const stripLang = (pathname: string): string => {
  const parts = pathname.split("/");
  const first = parts[1];
  if (isLocale(first as any)) {
    const rest = parts.slice(2).join("/");
    const out = "/" + rest.replace(/^\/+/, "");
    return out === "/" ? "/" : out;
  }
  return pathname;
};

/* ─────── Paths/Guards ─────── */

const AUTH_CALLBACK_PATHS = ["/auth/callback", "/auth/confirm", "/auth/oauth/callback"] as const;

const PUBLIC_AUTH_PAGES = ["/business/auth", "/business/forgot-password", "/business/reset-password"] as const;

// Routes die login vereisen
const PROTECTED_PREFIXES = ["/dashboard", "/business", "/account"] as const;

// Admin routes
const ADMIN_PREFIX = "/admin"; // admin + super_admin
const SUPER_PREFIX = "/godmode"; // alleen super_admin

// Altijd openbaar
const ALWAYS_PUBLIC_PREFIXES = ["/biz"] as const;

const pathStartsWithAny = (path: string, prefixes: readonly string[]) =>
  prefixes.some((p) => path === p || path.startsWith(p + "/"));

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

/* ─────── Roles (robust) ─────── */
// Leest zowel app_metadata.roles (array) als app_metadata.role (string)
// en valt terug op user_metadata indien nodig.
function getRolesFromUser(user: any): string[] {
  const meta = user?.app_metadata ?? {};
  const uMeta = user?.user_metadata ?? {};

  const raw =
    meta.roles ??
    meta.role ??
    user?.role ??
    uMeta.roles ??
    uMeta.role ??
    [];

  const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return arr.map((r) => String(r).trim().toLowerCase()).filter(Boolean);
}

function isSuperAdminUser(roles: string[]) {
  return roles.includes("super_admin") || roles.includes("superadmin");
}

function isAdminUser(roles: string[]) {
  return (
    roles.includes("admin") ||
    roles.includes("moderator") ||
    roles.includes("super_admin") ||
    roles.includes("superadmin")
  );
}

/* ───────── Middleware ───────── */

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const search = req.nextUrl.search || "";

  // 0) Altijd doorlaten: preflight/head + static assets/API
  if (req.method === "OPTIONS" || req.method === "HEAD" || isAssetOrApi(pathname)) {
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

  // 3) Auth callback routes altijd doorlaten (OOK met /{lang} prefix)
  if (AUTH_CALLBACK_PATHS.some((p) => pathNoLang === p || pathNoLang.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // 4) Maintenance page herkennen
  const isMaintenancePage = pathNoLang === "/maintenance" || pathNoLang.startsWith("/maintenance/");

  // 5) Bepaal public routes
  const isPublicPath =
    pathStartsWithAny(pathNoLang, ALWAYS_PUBLIC_PREFIXES) ||
    pathStartsWithAny(pathNoLang, PUBLIC_AUTH_PAGES) ||
    isMaintenancePage;

  // 6) Maak response + Supabase SSR client (cookie bridge)
  const res = NextResponse.next();
  type CookieSetOptions = Parameters<typeof res.cookies.set>[2];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnon) {
    console.error("[middleware] Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
    return res;
  }

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

  // 7) User + maintenance parallel ophalen
  const [userResult, maintResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "maintenance_mode")
      .maybeSingle(),
  ]);

  const user = userResult.data.user ?? null;

  // ✅ FIX: eigen role parsing (geen getRoleFlags mismatch)
  const roles = getRolesFromUser(user);
  const isSuper = isSuperAdminUser(roles);
  const isAdmin = isAdminUser(roles);

  // 8) Maintenance flag uitlezen
  let maintenanceOn = false;
  if (!maintResult.error) {
    const raw = (maintResult.data as any)?.value;
    maintenanceOn = raw === true || raw === "true" || raw === 1 || raw === "1";
  }

  // 9) Maintenance bypass (query + cookie)
  const bypassToken = process.env.MAINTENANCE_BYPASS_TOKEN;
  const urlToken = req.nextUrl.searchParams.get("bypass_maint");
  const hasQueryBypass = !!bypassToken && urlToken === bypassToken;
  const hasCookieBypass = !!bypassToken && req.cookies.get("gmabc_maint_bypass")?.value === bypassToken;

  const secureCookie = process.env.NODE_ENV === "production";

  if (hasQueryBypass && bypassToken) {
    res.cookies.set("gmabc_maint_bypass", bypassToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: secureCookie,
    });
  }

  const bypassMaintenance = hasQueryBypass || hasCookieBypass;

  // 10) Maintenance guard
  if (maintenanceOn && !isSuper && !isMaintenancePage && !bypassMaintenance) {
    const url = req.nextUrl.clone();
    url.pathname = `/${lang}/maintenance`;
    url.searchParams.delete("forbidden");
    url.searchParams.delete("redirectedFrom");
    return NextResponse.redirect(url);
  }

  // 11) Als route publiek is: laat door
  if (isPublicPath) {
    return res;
  }

  // 12) Admin/Godmode wensen
  const wantsAdmin = pathNoLang === ADMIN_PREFIX || pathNoLang.startsWith(ADMIN_PREFIX + "/");
  const wantsSuper = pathNoLang === SUPER_PREFIX || pathNoLang.startsWith(SUPER_PREFIX + "/");

  // 13) Moet ingelogd zijn?
  const needsAuth = wantsAdmin || wantsSuper || pathStartsWithAny(pathNoLang, PROTECTED_PREFIXES);

  // 14) Niet ingelogd → naar business/auth met redirect terug
  if (needsAuth && !user) {
    const url = req.nextUrl.clone();
    url.pathname = `/${lang}/business/auth`;
    url.searchParams.set("redirectedFrom", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  // 15) Godmode: alleen super_admin
  if (wantsSuper && !isSuper) {
    const url = req.nextUrl.clone();
    url.pathname = `/${lang}`;
    url.searchParams.set("forbidden", "super");
    return NextResponse.redirect(url);
  }

  // 16) Admin: admin + super_admin
  if (wantsAdmin && !isAdmin) {
    const url = req.nextUrl.clone();
    url.pathname = `/${lang}`;
    url.searchParams.set("forbidden", "admin");
    return NextResponse.redirect(url);
  }

  return res;
}

/* ───────── Matcher ───────── */
export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};