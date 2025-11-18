"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getLangFromPath } from "@/lib/locale-path";
import { langHref } from "@/lib/lang-href";
import { LogIn, Plus, LayoutDashboard, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils"; // optioneel; haal weg als je geen cn() hebt

export default function BusinessMenu() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const lang = useMemo(() => getLangFromPath(pathname) || "en", [pathname]);

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);

  // Buitenklik & Esc sluiten
  useEffect(() => {
    if (!open) return;

    const onDown = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        firstItemRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown, { passive: true });
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Helper: navigeren en menu sluiten
  const go = (to: string) => {
    setOpen(false);
    router.push(to);
  };

  return (
    <div ref={rootRef} className="relative">
      {/* Trigger */}
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
          "bg-background hover:bg-muted transition-colors"
        )}
      >
        {lang === "nl" ? "Voor Ondernemers" : "For Business"}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>

      {/* Panel */}
      {open && (
        <div
          role="menu"
          aria-label="Business menu"
          className="absolute right-0 z-50 mt-2 w-56 rounded-xl border bg-background p-1 shadow-lg"
        >
          <div className="px-3 py-2 text-sm font-medium opacity-70">
            {lang === "nl" ? "Ondernemers" : "Business"}
          </div>

          <button
            ref={firstItemRef}
            role="menuitem"
            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted focus:bg-muted focus:outline-none"
            onClick={() => go(langHref(lang, "/business/auth"))}
          >
            <LogIn className="h-4 w-4" />
            {lang === "nl" ? "Inloggen als bedrijf" : "Sign in"}
          </button>

          <button
            role="menuitem"
            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted focus:bg-muted focus:outline-none"
            onClick={() => go(langHref(lang, "/business/auth?tab=signup"))}
          >
            <Plus className="h-4 w-4" />
            {lang === "nl" ? "Nieuw bedrijf registreren" : "Register new business"}
          </button>

          <button
            role="menuitem"
            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted focus:bg-muted focus:outline-none"
            onClick={() => go(langHref(lang, "/business/dashboard"))}
          >
            <LayoutDashboard className="h-4 w-4" />
            {lang === "nl" ? "Dashboard" : "Dashboard"}
          </button>
        </div>
      )}
    </div>
  );
}