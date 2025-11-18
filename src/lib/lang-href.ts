// lib/lang-href.ts
import { isLocale, type Locale } from "@/i18n/config";

/**
 * Bouwt een taalpad dat altijd correct is binnen je Next.js app met [lang] routes.
 * 
 * 🔹 Voorbeeld:
 *   langHref("nl", "/business/auth") ➜ "/nl/business/auth"
 *   langHref("es", "/") ➜ "/es"
 *   langHref("pap", "/for-business") ➜ "/pap/for-business"
 * 
 * ✅ Voorkomt dubbele taalprefixes
 * ✅ Werkt ook als path al een taal bevat
 * ✅ Handig voor knoppen, navigatie en router.push()
 */
export function langHref(lang: string, path: string): string {
  const safeLang = isLocale(lang as Locale) ? (lang as Locale) : "en";

  // Zorg dat path altijd met een slash begint
  if (!path.startsWith("/")) path = "/" + path;

  // Controleer of het pad al een taal bevat
  const firstSegment = path.split("/")[1];
  if (["en", "nl", "pap", "es"].includes(firstSegment)) {
    return path; // Laat pad ongewijzigd
  }

  // Speciale case: root pad
  if (path === "/") return `/${safeLang}`;

  // Voeg taal toe
  return `/${safeLang}${path}`;
}