// src/lib/lang-href.ts
import { isLocale, type Locale } from "@/i18n/config";

/** Bouw een taalpad: langHref('nl', '/business/auth') => '/nl/business/auth' */
export function langHref(lang: string, path: string) {
  const safe = isLocale(lang as Locale) ? (lang as Locale) : "en";

  if (!path.startsWith("/")) path = "/" + path;

  // Als path al een taalprefix heeft, laat staan
  const seg = path.split("/")[1];
  if (["en", "nl", "pap", "es"].includes(seg)) return path;

  return `/${safe}${path}`;
}