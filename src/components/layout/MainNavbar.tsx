// src/components/layout/MainNavbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { langHref } from "@/lib/lang-href";
import { getLangFromPath } from "@/lib/locale-path";

const LOCALES = ["nl", "en", "pap", "es"] as const;
type Locale = (typeof LOCALES)[number];

type Props = {
  lang?: string;
};

export default function MainNavbar({ lang }: Props) {
  const pathname = usePathname() || "/";
  const currentLang = (getLangFromPath(pathname) || lang || "en") as Locale;
  const [open, setOpen] = useState(false);

  const navItems = [
    { label: "Eilanden", href: "/islands" },
    { label: "Bedrijven", href: "/businesses" },
    { label: "Blog", href: "/blog" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ];

  const isActive = (targetHref: string) => {
    const full = langHref(currentLang, targetHref);
    return pathname === full || pathname.startsWith(full + "/");
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href={langHref(currentLang, "/")}
          className="flex items-center gap-2"
        >
          <div className="h-9 w-9 rounded-full bg-teal-500/90 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            G
          </div>
          <div className="leading-tight">
            <p className="font-semibold text-sm sm:text-base text-foreground">
              Guide Me ABC
            </p>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Aruba • Bonaire • Curaçao
            </p>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={langHref(currentLang, item.href)}
              className={`text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "text-teal-600"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}

          {/* CTA voor ondernemers */}
          <Link
            href={langHref(currentLang, "/for-business")}
            className="rounded-full bg-teal-500 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-600 transition-colors"
          >
            Voor ondernemers
          </Link>

          {/* Taalwisselaar */}
          <LanguageSwitcher current={currentLang} />
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-3 md:hidden">
          <LanguageSwitcher current={currentLang} compact />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-full border border-border bg-background p-2 text-foreground shadow-sm"
          >
            {open ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={langHref(currentLang, item.href)}
                onClick={() => setOpen(false)}
                className={`block rounded-md px-2 py-1.5 text-sm font-medium ${
                  isActive(item.href)
                    ? "bg-teal-50 text-teal-700"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={langHref(currentLang, "/for-business")}
              onClick={() => setOpen(false)}
              className="mt-3 block rounded-md bg-teal-500 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-teal-600"
            >
              Voor ondernemers
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

type SwitcherProps = {
  current: Locale;
  compact?: boolean;
};

function LanguageSwitcher({ current, compact }: SwitcherProps) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-background/80 px-2 py-1 text-[11px] sm:text-xs">
      {LOCALES.map((code) => (
        <Link
          key={code}
          href={langHref(code, "/")}
          className={`px-1.5 sm:px-2 py-0.5 rounded-full font-medium uppercase tracking-wide ${
            current === code
              ? "bg-teal-500 text-white"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {compact ? code : code}
        </Link>
      ))}
    </div>
  );
}