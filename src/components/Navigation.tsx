// src/components/Navigation.tsx
"use client";

import ResponsiveImage from "@/components/ResponsiveImage";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Mail, MessageCircle, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { getLangFromPath } from "@/lib/locale-path";

type NavigationProps = { lang?: string };

const SUPPORTED = ["en", "nl", "pap", "es"] as const;
type L = (typeof SUPPORTED)[number];

export default function Navigation({ lang }: NavigationProps) {
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const pathname = usePathname() ?? "/";
  const { t } = useLanguage();

  useEffect(() => {
    setOpen(false);
    setLangOpen(false);
  }, [pathname]);

  const activeLang: L = useMemo(() => {
    const raw = (lang ?? getLangFromPath(pathname) ?? "en").toLowerCase();
    return (SUPPORTED.includes(raw as L) ? raw : "en") as L;
  }, [lang, pathname]);

  const Lbl = {
    aruba: t.aruba ?? "Aruba",
    bonaire: t.bonaire ?? "Bonaire",
    curacao: t.curacao ?? "Curaçao",
    businesses: t.businesses ?? "Businesses",
    blog: t.blog ?? "Blog",
    faq: t.faq ?? "FAQ",
    contact: (t as any).contact ?? "Contact",
    forBusiness: t.forBusiness ?? "For Business",
  };

  const links = [
    { href: `/${activeLang}/islands/aruba`, label: Lbl.aruba },
    { href: `/${activeLang}/islands/bonaire`, label: Lbl.bonaire },
    { href: `/${activeLang}/islands/curacao`, label: Lbl.curacao },
    { href: `/${activeLang}/businesses`, label: Lbl.businesses },
    { href: `/${activeLang}/blog`, label: Lbl.blog },
    { href: `/${activeLang}/faq`, label: Lbl.faq },
    { href: `/${activeLang}/contact`, label: Lbl.contact },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const LANG_LABEL: Record<L, string> = {
    en: "EN",
    nl: "NL",
    pap: "PAP",
    es: "ES",
  };

  const replaceLangInPath = (next: L) => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) return `/${next}`;
    if (SUPPORTED.includes(parts[0] as L)) {
      parts[0] = next;
      return `/${parts.join("/")}`;
    }
    return `/${next}${pathname.startsWith("/") ? "" : "/"}${pathname}`;
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter] : bg-background/80 supports-[backdrop-filter] : backdrop-blur-md">
      {/* iets hogere header + logo-wrapper zodat niets wordt afgesneden */}
      <div className="container mx-auto flex h-22 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <Link
          href={`/${activeLang}`}
          aria-label="Go to homepage"
          className="flex items-center gap-3"
        >
          <div className="relative flex h-[100px] w-[150px] items-center">
            <ResponsiveImage
              src="/images/logo_guide_me_abc.png"
              alt="Guide Me ABC"
              priority
              sizes="150px"
              className="object-contain"
            />
          </div>
        </Link>


        {/* Desktop navigatie */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-6 text-sm font-medium">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`relative flex h-10 items-center transition-colors ${
                isActive(l.href)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              {l.label}
              {isActive(l.href) && (
                <span className="absolute inset-x-0 -bottom-1 mx-auto h-[2px] w-7 rounded-full bg-primary" />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop rechterkant */}
        <div className="hidden md:flex items-center gap-4">
          {/* WhatsApp & Mail — onaangetast */}
          <div className="flex items-center gap-3 text-muted-foreground">
            <Link
              href="https://wa.me/59996763535"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="hover:text-primary transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
            </Link>
            <Link
              href="mailto:info@guide-me-abc.com"
              aria-label="Send an email"
              className="hover:text-primary transition-colors"
            >
              <Mail className="h-5 w-5" />
            </Link>
          </div>

          {/* Language knop – blauw → wit gradient */}
          <div className="rounded-full shadow-glow">
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02]"
              style={{
                background:
                  "linear-gradient(90deg, #00BFD3 0%, #A2E6F2 100%)",
                boxShadow: "0 3px 8px rgba(0,191,211,0.25)"
              }}
            >
              {LANG_LABEL[activeLang]}
              <ChevronDown className="h-4 w-4 opacity-80" />
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 w-40 overflow-hidden rounded-xl border bg-card shadow-md">
                {SUPPORTED.map((code) => (
                  <Link
                    key={code}
                    href={replaceLangInPath(code)}
                    className={`block px-4 py-2 text-sm hover:bg-muted ${
                      code === activeLang
                        ? "text-primary font-semibold"
                        : "text-foreground"
                    }`}
                  >
                    {LANG_LABEL[code]}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* For Business – koraal gradient */}
          <Button
            asChild
            className="font-semibold text-white shadow-md transition-transform duration-150 hover:scale-[1.02]"
            style={{
              background: "linear-gradient(90deg, #FF7A4F 0%, #FF946C 100%)",
              boxShadow: "0 3px 10px rgba(255,122,79,0.3)",
            }}
          >
            <Link href={`/${activeLang}/business/auth`}>
              {Lbl.forBusiness}
            </Link>
          </Button>
        </div>

        {/* Mobile burger */}
        <button
          className="inline-flex items-center justify-center rounded-md p-2 hover:bg-accent md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobiel menu – dropdown onder de header, met glas-effect achtig gevoel */}
     {open && (
  <>
    {/* 1. Overlay – alleen achtergrond dimmen + blur */}
    <div
      className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
      onClick={() => setOpen(false)}
      aria-hidden="true"
    />

    {/* 2. Het echte menu – erbovenop, met glass-effect */}
    <nav className="fixed inset-0 z-50 flex flex-col bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      
      {/* Nu pas je inhoud – met padding, scroll, etc. */}
      <div className="flex flex-col h-full px-6 pt-24 pb-8">   {/* pt-24 = ruimte voor je header erboven */}
        
        {/* Je links – netjes onder elkaar */}
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className={`py-4 text-lg font-medium border-b border-border/20 last:border-0 ${
              isActive(l.href) ? "text-primary" : "text-foreground"
            }`}
          >
            {l.label}
          </Link>
        ))}

        {/* Knoppen onderaan */}
        <div className="mt-auto space-y-4 pt-8">
          <Button asChild className="w-full text-white font-semibold" style={{ background: "linear-gradient(90deg, #00BFD3 0%, #A2E6F2 100%)", boxShadow: "0 3px 8px rgba(0,191,211,0.25)" }}>
            <Link href="#">{LANG_LABEL[activeLang]}</Link>
          </Button>

          <Button asChild className="w-full text-white font-semibold" style={{ background: "linear-gradient(90deg, #FF7A4F 0%, #FF946C 100%)", boxShadow: "0 3px 10px rgba(255,122,79,0.3)" }}>
            <Link href={`/${activeLang}/business/auth`} onClick={() => setOpen(false)}>
              {Lbl.forBusiness}
            </Link>
          </Button>
        </div>

      </div>
    </nav>
  </>
)}
</header>
  );
}