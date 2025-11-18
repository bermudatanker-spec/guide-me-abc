// src/lib/locale-path.ts
import { isLocale, type Locale, DEFAULT_LOCALE } from "@/i18n/config";

/** Maak een pad schoon: leading slash, geen dubbele slashes, strip ?query en #hash. */
function normalize(pathname: string | null | undefined): {
  path: string;          // opgeschoond pad (alleen path, geen query/hash)
  hadTrailingSlash: boolean; // of het origineel eindigde met /
} {
  let p = (pathname ?? "/").trim();

  // strip hash & query (App Router geeft normaal alleen het pad, maar just in case)
  const hashIdx = p.indexOf("#");
  if (hashIdx >= 0) p = p.slice(0, hashIdx);
  const qIdx = p.indexOf("?");
  if (qIdx >= 0) p = p.slice(0, qIdx);

  if (!p.startsWith("/")) p = "/" + p;
  // collapse multiple slashes
  p = p.replace(/\/{2,}/g, "/");

  const hadTrailingSlash = p.length > 1 && p.endsWith("/");
  if (p === "") p = "/";

  return { path: p, hadTrailingSlash };
}

/** Haal taal uit het URL-pad. Onbekend => DEFAULT_LOCALE. */
export function getLangFromPath(pathname: string | null | undefined): Locale {
  const { path } = normalize(pathname);
  const seg = path.split("/").filter(Boolean)[0] ?? "";
  return isLocale(seg) ? (seg as Locale) : DEFAULT_LOCALE;
}

/** Vervang/voeg het lang-segment in het pad in, behoudt trailing slash. */
export function replaceLangInPath(
  pathname: string | null | undefined,
  newLang: Locale
): string {
  const { path, hadTrailingSlash } = normalize(pathname);
  const parts = path.split("/").filter(Boolean);

  if (parts.length === 0) {
    // root -> "/{lang}"
    return `/${newLang}`;
  }

  if (isLocale(parts[0])) {
    parts[0] = newLang; // vervang
  } else {
    parts.unshift(newLang); // voeg toe
  }

  let result = "/" + parts.join("/");
  if (hadTrailingSlash && result !== "/" && !result.endsWith("/")) {
    result += "/";
  }
  return result;
}

/** Verwijder het lang-segment uit een pad (handig voor interne bouw). */
export function stripLangFromPath(
  pathname: string | null | undefined
): string {
  const { path, hadTrailingSlash } = normalize(pathname);
  const parts = path.split("/").filter(Boolean);

  if (parts.length === 0) return "/";

  if (isLocale(parts[0])) {
    parts.shift();
  }

  let result = parts.length ? "/" + parts.join("/") : "/";
  if (hadTrailingSlash && result !== "/" && !result.endsWith("/")) {
    result += "/";
  }
  return result;
}

/** Voeg een locale toe aan een basispad, ongeacht of er al een lang-segment stond. */
export function withLocale(basePath: string, lang: Locale): string {
  const stripped = stripLangFromPath(basePath);
  return replaceLangInPath(stripped, lang);
}