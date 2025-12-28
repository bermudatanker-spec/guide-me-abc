// src/components/Navigation.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Menu, X, Mail, MessageCircle, ChevronDown } from "lucide-react";

import ResponsiveImage from "@/components/ResponsiveImage";
import { Button } from "@/components/ui/button";

import { trackClick } from "@/lib/track/trackClick";
import { getLangFromPath } from "@/lib/locale-path";

type NavigationProps = { lang?: string };

// Pas aan indien je andere locales hebt
const SUPPORTED = ["en", "nl", "pap", "es"] as const;
type L = (typeof SUPPORTED)[number];

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function Navigation({ lang }: NavigationProps) {
  const pathname = usePathname() ?? "/";

  const activeLang = useMemo<L>(() => {
    const fromPath = getLangFromPath(pathname);
    const maybe = (lang ?? fromPath ?? "en").toLowerCase();
    return (SUPPORTED.includes(maybe as L) ? (maybe as L) : "en") as L;
  }, [lang, pathname]);

  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  // Sluit menu bij route change
  useEffect(() => {
    setOpen(false);
    setLangOpen(false);
  }, [pathname]);

  // Scroll lock + ESC sluit menu
  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const href = (p: string) => `/${activeLang}${p}`;

  const links = useMemo(
    () => [
      { label: "Aruba", href: href("/islands/aruba") },
      { label: "Bonaire", href: href("/islands/bonaire") },
      { label: "Curaçao", href: href("/islands/curacao") },
      { label: activeLang === "nl" ? "Bedrijven" : "Businesses", href: href("/business") },
      { label: "Blog", href: href("/blog") },
      { label: "FAQ", href: href("/faq") },
      { label: activeLang === "nl" ? "Contact" : "Contact", href: href("/contact") },
    ],
    [activeLang]
  );

  const isActive = (h: string) => {
    // match start, maar pak root netjes
    if (h === href("/")) return pathname === h;
    return pathname.startsWith(h);
  };

  const fire = (eventType: "whatsapp" | "route" | "call" | "website", businessId: string) => {
    void trackClick({
      businessId,
      eventType,
      path: pathname,
      lang: activeLang,
    });
  };

  // Header quick links
  const whatsappHref = "https://wa.me/59996763535";
  const mailHref = "mailto:info@guide-me-abc.com";

  // Language switch: vervang enkel de eerste /{lang} segment als die bestaat
  const switchTo = (nextLang: L) => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return `/${nextLang}`;
    if (SUPPORTED.includes(segments[0] as L)) {
      segments[0] = nextLang;
      return "/" + segments.join("/");
    }
    return `/${nextLang}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
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

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cx(
                  "text-sm font-medium transition-colors",
                  isActive(l.href) ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => fire("route", "site:nav")}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-3 text-muted-foreground">
              <a
                href={whatsappHref}
                onClick={() => fire("whatsapp", "site:whatsapp")}
                className="hover:opacity-90 transition-colors"
                aria-label="WhatsApp"
              >
                {/* ✅ WhatsApp icoon groen */}
                <MessageCircle className="h-5 w-5 text-[#25D366]" />
              </a>
              <a
                href={mailHref}
                onClick={() => fire("website", "site:email")}
                className="hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>

            {/* Account */}
            <Link
              href={href("/account")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => fire("route", "site:account")}
            >
              {activeLang === "nl" ? "Mijn account" : "My account"}
            </Link>

            {/* Language dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangOpen((v) => !v)}
                // ✅ Ocean knop uit globals, maten gelijk gehouden (px-3 py-2 text-sm rounded-full)
                className="inline-flex items-center gap-2 rounded-full border border-border button-gradient-ocean px-3 py-2 text-sm font-semibold text-white shadow-[0_4px_18px_rgba(0,0,0,0.18)] hover:opacity-95 transition"
                aria-label="Language"
                aria-expanded={langOpen}
              >
                <span className="uppercase">{activeLang}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {langOpen && (
                // ✅ Dropdown glass EXACT zoals header
                <div className="absolute right-0 mt-2 w-40 overflow-hidden rounded-xl bg-slate-900/40 backdrop-blur-x1 border border-white/25 shadow-[0_18px_45px_rgba(15,23,42,0.45)]">
                  {SUPPORTED.map((l) => (
                    <Link
                      key={l}
                      href={switchTo(l)}
                      onClick={() => {
                        setLangOpen(false);
                        fire("route", "site:lang");
                      }}
                      className={cx(
                        "block px-4 py-3 text-sm transition text-white",
                        l === activeLang ? "bg-white/15 font-semibold text-foreground" : "hover:bg-white/10"
                      )}
                    >
                      <span className="uppercase">{l}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* For businesses CTA (koraal uit globals: button-gradient) */}
            <Link
              href={href("/for-business")}
              className="button-gradient rounded-full px-4 py-2 text-sm font-semibold"
              onClick={() => fire("route", "site:for-business")}
              aria-label="For businesses"
            >
              {activeLang === "nl" ? "Voor bedrijven" : "For businesses"}
            </Link>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* ✅ Mobile panel glass EXACT zoals header */}
          <nav className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute right-0 mt-2 w-40 overflow-hidden rounded-xl bg-slate-900/40 backdrop-blur-x1 border border-white/25 shadow-[0_18px_45px_rgba(15,23,42,0.45)]">
              aria-label={activeLang === "nl" ? "Sluit menu" : "Close menu"}
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col h-full px-6 pt-20 pb-10 overflow-y-auto">
              {/* Primary links */}
              <div className="flex flex-col">
                {SUPPORTED.map((code: L) => (
                  <Link
                key={`lang-${code}`}
                href={switchTo(code)}
                onClick={() => {
                setOpen(false);
                fire("route", "site:lang");
              }}
            className={cx(
              "inline-flex items-center justify-center rounded-full px-3 py-2 text-sm font-semibold border border-white/30 text-white",
              code === activeLang
              ? "bg-white/20"
              : "bg-white/10 hover:bg-white/20"
              )}
                >
              {code.toUpperCase()}
                </Link>
                ))}
              </div>
              {/* Actions */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {/* ✅ WhatsApp knop groen */}
                <a
                  href={whatsappHref}
                  onClick={() => {
                    setOpen(false);
                    fire("whatsapp", "site:whatsapp");
                  }}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-glow bg-[#25D366] hover:opacity-95 transition"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>

                <a
                  href={mailHref}
                  onClick={() => {
                    setOpen(false);
                    fire("website", "site:email");
                  }}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border border-border bg-background shadow-[0_6px_18px_rgba(0,0,0,0.18)] hover:bg-muted transition"
                  aria-label="Email"
                >
                  <Mail className="h-4 w-4" />
                  {activeLang === "nl" ? "Mail" : "Email"}
                </a>

                <Link
                  href={href("/account")}
                  onClick={() => {
                    setOpen(false);
                    fire("route", "site:account");
                  }}
                  className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold border border-border bg-background shadow-[0_6px_18px_rgba(0,0,0,0.18)] hover:bg-muted transition"
                >
                  {activeLang === "nl" ? "Mijn account" : "My account"}
                </Link>

                <Link
                  href={href("/for-business")}
                  onClick={() => {
                    setOpen(false);
                    fire("route", "site:for-business");
                  }}
                  className="button-gradient rounded-full px-4 py-2 text-sm font-semibold"
                >
                  {activeLang === "nl" ? "Voor bedrijven" : "For businesses"}
                </Link>
              </div>

              {/* Language quick switch */}
              <div className="mt-8">
                <div className="text-sm font-semibold text-muted-foreground mb-3">
                  {activeLang === "nl" ? "Taal" : "Language"}
                </div>
                <div className="flex flex-wrap gap-2">
                  {SUPPORTED.map((l) => (
                    <Link
                      key={l}
                      href={switchTo(l)}
                      onClick={() => {
                        setOpen(false);
                        fire("route", "site:lang");
                      }}
                      className={cx(
                        "inline-flex items-center justify-center rounded-full px-3 py-2 text-sm font-semibold border border-border",
                        l === activeLang ? "bg-muted text-foreground" : "bg-background text-muted-foreground hover:bg-muted/70"
                      )}
                    >
                      {l.toUpperCase()}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-10 text-xs text-muted-foreground">
                © {new Date().getFullYear()} Guide Me ABC
              </div>
            </div>
          </nav>
        </>
      )}
    </>
  );
}