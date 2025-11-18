"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";

/* ---------------- Types ---------------- */
export type Lang = "en" | "nl" | "pap" | "es";
type Dict = Record<string, string>;

type LanguageContextValue = {
  lang: Lang;
  t: Dict;
  setLanguage: (lang: Lang) => void;
};

const SUPPORTED = ["en", "nl", "pap", "es"] as const;
const isLang = (v: string | null): v is Lang =>
  !!v && (SUPPORTED as readonly string[]).includes(v as Lang);

/* --------------- Dictionaries (jouw huidige) --------------- */
export const DICTS: Record<Lang, Dict> = {
  en: {
    aruba: "Aruba",
    bonaire: "Bonaire",
    curacao: "Curaçao",
    businesses: "Businesses",
    blog: "Blog",
    faq: "FAQ",
    forBusiness: "For Business",
    exploreIslands: "Discover the ABC Islands",
    heroSubtitle:
      "Your complete guide to Aruba, Bonaire & Curaçao — beaches, restaurants, tours and trusted local businesses.",
    faqSubtitle:
      "Your complete guide to Aruba, Bonaire & Curaçao — beaches, restaurants, tours and trusted local businesses.",
    browseBusinesses: "Browse Businesses",
    exploreIslandsCta: "Explore Islands",
    contact: "Contact",
  },
  nl: {
    aruba: "Aruba",
    bonaire: "Bonaire",
    curacao: "Curaçao",
    businesses: "Bedrijven",
    blog: "Blog",
    faq: "FAQ",
    forBusiness: "Voor bedrijven",
    exploreIslands: "Ontdek de ABC-eilanden",
    heroSubtitle:
      "Jouw complete gids voor Aruba, Bonaire & Curaçao — stranden, restaurants, tours en betrouwbare bedrijven.",
    faqSubtitle:
      "Jouw complete gids voor Aruba, Bonaire & Curaçao — stranden, restaurants, tours en betrouwbare bedrijven.",
    browseBusinesses: "Bedrijven bekijken",
    exploreIslandsCta: "Eilanden verkennen",
    contact: "Contact",
  },
  pap: {
    aruba: "Aruba",
    bonaire: "Boneiru",
    curacao: "Kòrsou",
    businesses: "Negoshi",
    blog: "Blog",
    faq: "FAQ",
    forBusiness: "Pa Negoshi",
    exploreIslands: "Deskubrí e isla-nan ABC",
    heroSubtitle:
      "Bo guia kompletu pa Aruba, Boneiru & Kòrsou — playa, restaurant, tour i negoshi konfiabel.",
    faqSubtitle:
      "Bo guia kompletu pa Aruba, Boneiru & Kòrsou — playa, restaurant, tour i negoshi konfiabel.",
    browseBusinesses: "Mira Negoshi",
    exploreIslandsCta: "Eksplorá Isla-nan",
    contact: "Kontakt",
  },
  es: {
    aruba: "Aruba",
    bonaire: "Bonaire",
    curacao: "Curazao",
    businesses: "Negocios",
    blog: "Blog",
    faq: "Preguntas frecuentes",
    forBusiness: "Para empresas",
    exploreIslands: "Descubre las islas ABC",
    heroSubtitle:
      "Tu guía completa de Aruba, Bonaire y Curazao — playas, restaurantes, tours y negocios locales de confianza.",
    faqSubtitle:
      "Tu guía completa de Aruba, Bonaire y Curazao — playas, restaurantes, tours y negocios locales de confianza.",
    browseBusinesses: "Ver negocios",
    exploreIslandsCta: "Explorar islas",
    contact: "Contacto",
  },
};

/* --------------- Context --------------- */
const LanguageContext = createContext<LanguageContextValue | null>(null);

/* --------------- Provider --------------- */
/**
 * URL is de bron van de waarheid:
 * - `initialLang` komt uit `[lang]` segment
 * - we syncen bij elke routewissel (als het segment verandert)
 * - we schrijven de keuze weg in localStorage (handig voor non-`/[lang]` routes)
 */
export function LanguageProvider({
  children,
  initialLang = "en",
}: {
  children: React.ReactNode;
  initialLang?: Lang;
}) {
  const pathname = usePathname() ?? "/";
  const [lang, setLang] = useState<Lang>(initialLang);

  // 1) On mount: neem initialLang (uit URL) als waarheid,
  //    en overschrijf localStorage ermee.
  useEffect(() => {
    setLang(initialLang);
    try {
      localStorage.setItem("lang", initialLang);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // alleen bij eerste mount

  // 2) Bij routewissel: haal `[lang]` segment uit de URL en sync indien anders.
  useEffect(() => {
    const seg = pathname.split("/")[1] || "";
    if (isLang(seg) && seg !== lang) {
      setLang(seg);
      try {
        localStorage.setItem("lang", seg);
      } catch {}
    }
  }, [pathname, lang]);

  const t = useMemo(() => DICTS[lang], [lang]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      t,
      setLanguage: (l: Lang) => {
        setLang(l);
        try {
          localStorage.setItem("lang", l);
        } catch {}
      },
    }),
    [lang, t]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

/* --------------- Hook --------------- */
export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (ctx) return ctx;
  // Fallback wanneer Provider ontbreekt
  return {
    lang: "en",
    t: DICTS.en,
    setLanguage: () => {},
  };
}