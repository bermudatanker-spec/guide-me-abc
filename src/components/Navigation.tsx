// src/components/Navigation.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Menu, X, Mail, MessageCircle, ChevronDown } from "lucide-react";

import ResponsiveImage from "@/components/ResponsiveImage";
import { Button } from "@/components/ui/button";
import LogoutButton from "@/components/auth/LogoutButton";

import { trackClick } from "@/lib/track/trackClick";
import { getLangFromPath } from "@/lib/locale-path";

type NavigationProps = { lang?: string; isLoggedIn?: boolean };

const SUPPORTED = ["en", "nl", "pap", "es"] as const;
type L = (typeof SUPPORTED)[number];

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function Navigation({ lang, isLoggedIn }: NavigationProps) {
  const pathname = usePathname() ?? "/";

  const loggedIn = Boolean (isLoggedIn);

  
  const activeLang = useMemo<L>(() => {
    const fromPath = getLangFromPath(pathname);
    const maybe = (lang ?? fromPath ?? "en").toLowerCase();
    return (SUPPORTED.includes(maybe as L) ? (maybe as L) : "en") as L;
  }, [lang, pathname]);

  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const href = useCallback((p: string) => `/${activeLang}${p}`, [activeLang]);

  const isActive = useCallback(
    (h: string) => {
      if (h === href("/")) return pathname === h;
      return pathname.startsWith(h);
    },
    [href, pathname]
  );

  const fire = useCallback(
    (eventType: "whatsapp" | "route" | "call" | "website", businessId: string) => {
      void trackClick({
        businessId,
        eventType,
        path: pathname,
        lang: activeLang,
      });
    },
    [activeLang, pathname]
  );

  useEffect(() => {
    setOpen(false);
    setLangOpen(false);
  }, [pathname]);

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

  const links = useMemo(
    () => [
      { label: "Aruba", href: href("/islands/aruba") },
      { label: "Bonaire", href: href("/islands/bonaire") },
      { label: "Curaçao", href: href("/islands/curacao") },
      {
        label: activeLang === "nl" ? "Bedrijven" : "Businesses",
        href: href("/businesses"),
      },
      { label: "Blog", href: href("/blog") },
      { label: "FAQ", href: href("/faq") },
      { label: activeLang === "nl" ? "Contact" : "Contact", href: href("/contact") },
    ],
    [activeLang, href]
  );

  const whatsappHref = "https://wa.me/59996763535";
  const mailHref = "mailto:info@guide-me-abc.com";

  const switchTo = useCallback(
    (nextLang: L) => {
      const segments = pathname.split("/").filter(Boolean);
      if (segments.length === 0) return `/${nextLang}`;
      if (SUPPORTED.includes(segments[0] as L)) {
        segments[0] = nextLang;
        return "/" + segments.join("/");
      }
      return `/${nextLang}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
    },
    [pathname]
  );

  const onOpenMobile = useCallback(() => setOpen(true), []);
  const onCloseMobile = useCallback(() => setOpen(false), []);
  const onToggleLang = useCallback(() => setLangOpen((v) => !v), []);
  const onCloseLang = useCallback(() => setLangOpen(false), []);

  return (
    <>
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

          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-3 text-muted-foreground">
              <a
                href={whatsappHref}
                onClick={() => fire("whatsapp", "site:whatsapp")}
                className="hover:opacity-90 transition-colors"
                aria-label="WhatsApp"
              >
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

          {loggedIn && (
          <>
            <Link
                href={href("/account")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => fire("route", "site:account")}
            >
                {activeLang === "nl" ? "Mijn account" : "My account"}
            </Link>

            <LogoutButton
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                label={activeLang === "nl" ? "Uitloggen" : "Log out"}
                onDone={() => fire("route", "site:logout")}
            />
            </>
                )}

            <div className="relative">
              <button
                type="button"
                onClick={onToggleLang}
                className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm font-semibold text-white shadow-[0_4px_18px_rgba(0,0,0,0.18)] hover:opacity-95 transition"
                style={{
                  background: "linear-gradient(90deg, #00BFD3 0%, #A2E6F2 100%)",
                  boxShadow: "0 3px 8px rgba(0,191,211,0.25)",
                }}
                aria-label="Language"
                aria-expanded={langOpen}
                aria-haspopup="menu"
              >
                <span className="uppercase">{activeLang}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {langOpen && (
                <div
                  className="absolute right-0 mt-2 w-40 overflow-hidden rounded-xl border border-white/25 bg-slate-900/40 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.45)]"
                  role="menu"
                >
                  {SUPPORTED.map((l) => (
                    <Link
                      key={l}
                      href={switchTo(l)}
                      onClick={() => {
                        onCloseLang(); // ✅ echte call
                        fire("route", "site:lang");
                      }}
                      className={cx(
                        "block px-4 py-3 text-sm transition text-white",
                        l === activeLang ? "bg-white/15 font-semibold text-white" : "hover:bg-white/10"
                      )}
                      role="menuitem"
                    >
                      <span className="uppercase">{l}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href={href("/for-business")}
              className="button-gradient rounded-full px-4 py-2 text-sm font-semibold"
              onClick={() => fire("route", "site:for-business")}
              aria-label="For businesses"
            >
              {activeLang === "nl" ? "Voor bedrijven" : "For businesses"}
            </Link>
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={onOpenMobile} aria-label="Open menu">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          <nav className="fixed inset-0 z-50 flex flex-col bg-background/85 backdrop-blur">
            <button
              onClick={onCloseMobile}
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background/70 shadow-[0_6px_20px_rgba(0,0,0,0.22)]"
              aria-label={activeLang === "nl" ? "Sluit menu" : "Close menu"}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col h-full px-6 pt-20 pb-10 overflow-y-auto">
              <div className="flex flex-col">
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => {
                      onCloseMobile();
                      fire("route", "site:nav");
                    }}
                    className={cx(
                      "py-5 text-lg font-medium border-b border-border/20 transition-colors",
                      isActive(l.href) ? "text-primary" : "text-foreground"
                    )}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href={whatsappHref}
                  onClick={() => {
                    onCloseMobile();
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
                    onCloseMobile();
                    fire("website", "site:email");
                  }}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border border-border bg-background shadow-[0_6px_18px_rgba(0,0,0,0.18)] hover:bg-muted transition"
                  aria-label="Email"
                >
                  <Mail className="h-4 w-4" />
                  {activeLang === "nl" ? "Mail" : "Email"}
                </a>

                {loggedIn && (
                <>
                <Link
                  href={href("/account")}
                  onClick={() => {
                  onCloseMobile();
                  fire("route", "site:account");
                  }}
                  className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold border border-border bg-background shadow-[0_6px_18px_rgba(0,0,0,0.18)] hover:bg-muted transition"
                >
                  {activeLang === "nl" ? "Mijn account" : "My account"}
                </Link>

                <LogoutButton
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  label={activeLang === "nl" ? "Uitloggen" : "Log out"}
                  onDone={() => {
                  onCloseMobile();
                  fire("route", "site:logout");
                  }}
                />
                </>
                  )}

                <Link
                  href={href("/for-business")}
                  onClick={() => {
                    onCloseMobile();
                    fire("route", "site:for-business");
                  }}
                  className="button-gradient rounded-full px-4 py-2 text-sm font-semibold"
                >
                  {activeLang === "nl" ? "Voor bedrijven" : "For businesses"}
                </Link>
              </div>

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
                        onCloseMobile();
                        fire("route", "site:lang");
                      }}
                      className={cx(
                        "inline-flex items-center justify-center rounded-full px-3 py-2 text-sm font-semibold border border-white/20 backdrop-blur",
                        l === activeLang
                          ? "bg-white/20 text-white"
                          : "bg-white/10 text-white/90 hover:bg-white/20"
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