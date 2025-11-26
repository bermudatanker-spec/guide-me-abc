// src/components/home/SearchBar.tsx
"use client";

import React, { useMemo, useState, type FormEvent } from "react";
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

type Props = {
  lang?: string;
};

export default function SearchBar({ lang: propLang }: Props) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";

  const derivedLang = useMemo<UiLang>(() => {
    const seg = pathname.split("/")[1];
    return (["en", "nl", "es", "pap"] as const).includes(seg as UiLang)
      ? (seg as UiLang)
      : "en";
  }, [pathname]);

  const lang: UiLang =
    propLang && propLang in TRANSLATIONS
      ? (propLang as UiLang)
      : derivedLang;

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
    <div className="w-full">
      <form
        onSubmit={onSubmit}
        className="mx-auto w-full max-w-[860px]
                   rounded-3xl border border-white/45 bg-white/70
                   p-4 shadow-[0_18px_45px_rgba(15,23,42,0.35)]
                   backdrop-blur-2xl
                   grid grid-cols-1 gap-3
                   md:grid-cols-[minmax(0,1.4fr),minmax(0,0.9fr),minmax(0,0.8fr)]"
      >
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.placeholder}
          className="w-full rounded-2xl border border-white/60 bg-white/80
                     px-4 py-3 text-sm md:text-base
                     placeholder:text-slate-400
                     focus:outline-none focus:ring-2 focus:ring-teal-400/60"
        />

        <select
          value={island}
          onChange={(e) => setIsland(e.target.value as Island)}
          className="rounded-2xl border border-white/60 bg-white/80
                     px-4 py-3 text-sm md:text-base
                     focus:outline-none focus:ring-2 focus:ring-teal-400/60"
        >
          <option value="all">{t.allIslands}</option>
          <option value="aruba">{t.aruba}</option>
          <option value="bonaire">{t.bonaire}</option>
          <option value="curacao">{t.curacao}</option>
        </select>

        <button
          type="submit"
          className="rounded-2xl px-4 py-3 text-sm md:text-base font-semibold text-white
                     transition-transform duration-200 ease-out hover:scale-[1.02]"
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
    </div>
  );
}