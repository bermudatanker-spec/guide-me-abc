"use client";

import React, { useState, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";

type Island = "all" | "aruba" | "bonaire" | "curacao";

export default function SearchBar() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();

  // Detecteer taal
  const lang = React.useMemo(() => {
    const seg = pathname.split("/")[1];
    return (["en", "nl", "pap", "es"] as const).includes(seg as any) ? seg : "en";
  }, [pathname]) as "en" | "nl" | "pap" | "es";

  const [q, setQ] = useState("");
  const [island, setIsland] = useState<Island>("all");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (island !== "all") params.set("island", island);
    router.push(`/${lang}/search?${params.toString()}`);
  };

  return (
    // nog iets hoger: translate-y-[-2rem] = iets omhoog
    <div className="pointer-events-none relative z-30 -translate-y-2 md:-translate-y-4">
      <div className="pointer-events-auto mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 gap-3 rounded-2xl border border-border/60 bg-card/95 p-3 shadow-xl backdrop-blur md:grid-cols-[1fr,180px,140px]"
          style={{
            boxShadow: "0 12px 30px rgba(0,0,0,.18)",
          }}
        >
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for restaurants, activities, shops..."
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />

          <select
            value={island}
            onChange={(e) => setIsland(e.target.value as Island)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="all">All Islands</option>
            <option value="aruba">Aruba</option>
            <option value="bonaire">Bonaire</option>
            <option value="curacao">Curaçao</option>
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
            Search
          </button>
        </form>
      </div>
    </div>
  );
}