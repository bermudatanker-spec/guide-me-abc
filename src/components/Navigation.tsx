// src/components/Navigation.tsx
"use client";


import ResponsiveImage from "@/components/ResponsiveImage";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { trackClick } from "@/lib/track/trackClick";
import { Menu, X, Mail, MessageCircle, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { getLangFromPath } from "@/lib/locale-path";
import type { Locale } from "@/i18n/config";

type NavigationProps = { lang?: Locale };

const SUPPORTED = ["en", "nl", "pap", "es"] as const;
type L = (typeof SUPPORTED)[number];

export default function Navigation({ lang }: NavigationProps) {
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const pathname = usePathname() ?? "/";
  const { t } = useLanguage();

  // ✨ Menu sluiten bij route-change
  useEffect(() => {
    setOpen(false);
    setLangOpen(false);
  }, [pathname]);

  // ✨ Scroll lock + ESC om menu te sluiten
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

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
    account:
      (t as any).account ??
      (activeLang === "nl" ? "Mijn account" : "My account"),
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

  return (
    <>
      {/* ===================== HEADER ===================== */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex h-22 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href={`/${activeLang}`} className="flex items-center gap-3">
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

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex flex-1 items-center justify-center gap-6 text-sm font-medium">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
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

          {/* DESKTOP RIGHT SIDE */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Link
                href="https://wa.me/59996763535"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  void trackClick({
                    businessId: "site:whatsapp",
                    eventType: "whatsapp",
                    path: pathname,
                    lang,
                  });
                }}
                className="hover:text-primary transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
              </Link>
              <Link
                href="mailto:info@guide-me-abc.com"
                onClick = {() => {
                  void trackClick ({
                    businessId: "site:email",
                    eventType: "website",
                    path: pathname,
                    lang,
                  });
                }}
                className="hover:text-primary transition-colors"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>

            {/* Account link (desktop) */}
            <Link
              href={`/${activeLang}/account`}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {Lbl.account}
            </Link>

            {/* Language switcher (desktop) */}
            <div className="relative rounded-full shadow-glow">
              <button
                onClick={() => setLangOpen((v) => !v)}
                className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02]"
                style={{
                  background:
                    "linear-gradient(90deg, #00BFD3 0%, #A2E6F2 100%)",
                  boxShadow: "0 3px 8px rgba(0,191,211,0.25)",
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

            {/* Voor bedrijven (desktop) */}
            <Button
              asChild
              className="button-gradient font-semibold text-white shadow-md transition-transform duration-150 hover:scale-[1.02]"
            >
              <Link href={`/${activeLang}/for-business`}>
                {Lbl.forBusiness}
              </Link>
            </Button>
          </div>

          {/* MOBILE TOGGLE BUTTON */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-md p-2 hover:bg-accent md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* ===================== MOBIEL MENU ===================== */}
      {open && (
        <>
          {/* backdrop (bij klik sluit menu) */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <nav className="fixed inset-0 z-50 flex flex-col bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
            {/* Close button in het menu zelf */}
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-6 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/90 shadow-card"
              aria-label="Sluit menu"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col h-full px-6 pt-28 pb-10 overflow-y-auto">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`py-5 text-lg font-medium border-b border-border/20 last:border-0 ${
                    isActive(l.href) ? "text-primary" : "text-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              ))}

              {/* Account link (mobile) */}
              <Link
                href={`/${activeLang}/account`}
                onClick={() => setOpen(false)}
                className="py-5 text-lg font-semibold text-primary border-b border-border/20"
              >
                {Lbl.account}
              </Link>

              <div className="mt-auto space-y-4 pt-10">
                {/* Taalselector – mobiel */}
                <div className="relative">
                  <button
                    onClick={() => setLangOpen((v) => !v)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-white font-semibold transition hover:scale-[1.02]"
                    style={{
                      background:
                        "linear-gradient(90deg, #00BFD3 0%, #A2E6F2 100%)",
                      boxShadow: "0 3px 8px rgba(0,191,211,0.25)",
                    }}
                  >
                    {LANG_LABEL[activeLang]}
                    <ChevronDown
                      className={`h-5 w-5 transition-transform ${
                        langOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {langOpen && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 rounded-xl border bg-card shadow-xl overflow-hidden">
                      {SUPPORTED.map((code) => (
                        <Link
                          key={code}
                          href={replaceLangInPath(code)}
                          onClick={() => {
                            setLangOpen(false);
                            setOpen(false);
                          }}
                          className={`block px-6 py-4 text-center font-medium transition hover:bg-muted ${
                            code === activeLang
                              ? "text-primary"
                              : "text-foreground"
                          }`}
                        >
                          {LANG_LABEL[code]}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Voor bedrijven (mobile) */}
                <Button
                  asChild
                  className="button-gradient w-full text-white font-semibold rounded-full py-6 transition hover:scale-[1.02]"
                >
                  <Link
                    href={`/${activeLang}/for-business`}
                    onClick={() => setOpen(false)}
                  >
                    {Lbl.forBusiness}
                  </Link>
                </Button>
              </div>
            </div>
          </nav>
        </>
      )}
    </>
  );
}