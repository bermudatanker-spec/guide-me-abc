"use client";

import ResponsiveImage from "@/components/ResponsiveImage"; // ⬅️ of "@/components/ResponsiveImage"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Mail, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/hooks/useLanguage";
import { getLangFromPath } from "@/lib/locale-path";
import BusinessMenu from "./nav/BusinessMenu";

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "/";
  const { t } = useLanguage();
  useEffect(() => setOpen(false), [pathname]);

  const lang = getLangFromPath(pathname);

  /* ---------- Labels ---------- */
  const L = {
    aruba: t.aruba ?? "Aruba",
    bonaire: t.bonaire ?? "Bonaire",
    curacao: t.curacao ?? "Curaçao",
    businesses: t.businesses ?? "Businesses",
    blog: t.blog ?? "Blog",
    faq: t.faq ?? "FAQ",
    contact: (t as any).contact ?? "Contact",
    forBusiness: t.forBusiness ?? "For Business",
  };

  /* ---------- Links ---------- */
  const links = [
    { href: `/${lang}/islands/aruba`, label: L.aruba },
    { href: `/${lang}/islands/bonaire`, label: L.bonaire },
    { href: `/${lang}/islands/curacao`, label: L.curacao },
    { href: `/${lang}/businesses`, label: L.businesses },
    { href: `/${lang}/blog`, label: L.blog },
    { href: `/${lang}/faq`, label: L.faq },
    { href: `/${lang}/contact`, label: L.contact },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  /* ---------- Render ---------- */
  return (
    <header className="fixed top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <Link
          href={`/${lang}`}
          aria-label="Go to homepage"
          className="flex items-center gap-3"
        >
          <div className="relative h-10 w-[160px]"> 
            <ResponsiveImage
              src="/images/logo_guide_me_abc.png"
              alt="Guide Me ABC"
              priority
              sizes="160px"
              className="object-contain"
            />
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={
                isActive(l.href)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              }
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-4">
          {/* Contact icons */}
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

          {/* Language + CTA */}
          <LanguageSelector />
          <BusinessMenu />
        </div>

        {/* Mobile burger menu button */}
        <button
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-accent"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {open && (
        <nav className="md:hidden border-t border-border bg-background">
          <div className="flex flex-col items-start space-y-3 p-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={
                  "w-full py-2 text-sm " +
                  (isActive(l.href)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary")
                }
              >
                {l.label}
              </Link>
            ))}

            {/* Contact icons mobile */}
            <div className="pt-3 border-t border-border mt-2 w-full flex items-center gap-4 text-muted-foreground">
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

            <div className="pt-2 w-full">
              <LanguageSelector />
            </div>

            <Button
              asChild
              className="w-full mt-2 text-white font-semibold transition-transform duration-200 ease-out hover:scale-[1.02]"
              style={{
                background: "linear-gradient(90deg, #FF7A4F 0%, #FF946C 100%)",
                boxShadow: "0 2px 6px rgba(255,122,79,0.18)",
              }}
            >
              <Link href={`/${lang}/business/auth`}>{L.forBusiness}</Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}