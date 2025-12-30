import type { Locale } from "@/i18n/config";

export function getBusinessesCopy(lang: Locale) {
  return {
    heading:
      lang === "nl"
        ? "Ontdek Bedrijven"
        : lang === "pap"
        ? "Deskubri Negoshinan"
        : lang === "es"
        ? "Descubre Negocios"
        : "Discover Businesses",
    sub:
      lang === "nl"
        ? "Browse lokale bedrijven op de ABC-eilanden"
        : lang === "pap"
        ? "Eksplora negoshinan lokal riba e Islanan ABC"
        : lang === "es"
        ? "Explora negocios locales en las Islas ABC"
        : "Browse local businesses across the ABC Islands",
    allIslands:
      lang === "nl"
        ? "Alle eilanden"
        : lang === "pap"
        ? "Tur isla"
        : lang === "es"
        ? "Todas las islas"
        : "All islands",
    empty:
      lang === "nl"
        ? "Nog geen actieve bedrijven in deze selectie."
        : "No active businesses published yet for this selection.",
    view:
      lang === "nl" ? "Bekijk details" : "View details",
    noMini:
      lang === "nl" ? "Geen mini-site" : "No mini-site",
  };
}