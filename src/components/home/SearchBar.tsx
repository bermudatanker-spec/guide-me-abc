"use client";

import React, { useState, useMemo, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";

type Island = "all" | "aruba" | "bonaire" | "curacao";

const TRANSLATIONS = {
  en: {
    placeholder: "Search for restaurants, activities, shops...",
    allIslands: "All Islands",
    aruba: "Aruba",
    bonaire: "Bonaire",
    curacao: "Curaçao",
    search: "Search",
  },
  nl: {
    placeholder: "Zoek naar restaurants, activiteiten, winkels...",
    allIslands: "Alle eilanden",
    aruba: "Aruba",
    bonaire: "Bonaire",
    curacao: "Curaçao",
    search: "Zoeken",
  },
  es: {
    placeholder: "Busca restaurantes, actividades, tiendas...",
    allIslands: "Todas las islas",
    aruba: "Aruba",
    bonaire: "Bonaire",
    curacao: "Curaçao",
    search: "Buscar",
  },
  pap: {
    placeholder: "Buska restorantnan, aktividatnan, tiendanan...",
    allIslands: "Tur isla",
    aruba: "Aruba",
    bonaire: "Boneiru",
    curacao: "Kòrsou",
    search: "Buska",
  },
} as const;

type UiLang = keyof typeof TRANSLATIONS;

type SearchBarProps = {
  lang?: string;
  className?: string;
};

export default function SearchBar({ lang: propLang, className }: SearchBarProps) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();

  const lang: UiLang = useMemo(() => {
    // 1) probeer expliciete prop
    if (propLang && propLang in TRANSLATIONS) {
      return propLang as UiLang;
    }

    // 2) anders: haal uit URL: /en/..., /nl/..., /es/..., /pap/...
    const seg = pathname.split("/")[1];
    if ((["en", "nl", "es", "pap"] as const).includes(seg as UiLang)) {
      return seg as UiLang;
    }

    // 3) fallback
    return "en";
  }, [propLang, pathname]);

  const [q, setQ] = useState("");
  const [island, setIsland] = useState<Island>("all");

  const t = TRANSLATIONS[lang];

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (island !== "all") params.set("island", island);

    router.push(`/${lang}/search?${params.toString()}`);
  };

  return (
    <form
      onSubmit={onSubmit}
      className={`grid grid-cols-1 gap-3 rounded-2xl border border-border/60 bg-card/95 p-3 shadow-xl backdrop-blur md:grid-cols-[1fr,180px,140px] ${className ?? ""}`}
      style={{
        boxShadow: "0 12px 30px rgba(0,0,0,.18)",
      }}
    >
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t.placeholder}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
      />

      <select
        value={island}
        onChange={(e) => setIsland(e.target.value as Island)}
        className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        <option value="all">{t.allIslands}</option>
        <option value="aruba">{t.aruba}</option>
        <option value="bonaire">{t.bonaire}</option>
        <option value="curacao">{t.curacao}</option>
      </select>

      <button
        type="submit"
        className="rounded-md px-4 py-2 text-sm font-semibold text-white transition-transform duration-300 ease-out hover:scale-[1.02]"
        style={{
          background: "linear-gradient(90deg, #00BFD3 0%, #009EC2 100%)",
          boxShadow:
            "0 6px 16px rgba(0,191,211,0.45), 0 0 18px rgba(0,191,211,0.30)",
          textShadow: "0 1px 2px rgba(0,0,0,0.35)",
        }}
      >
        {t.search}
      </button>
    </form>
  );
}