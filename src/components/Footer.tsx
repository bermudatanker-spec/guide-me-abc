"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getLangFromPath } from "@/lib/locale-path";
import { Facebook, Instagram, Twitter, Mail } from "lucide-react";

/** Kleine helper voor interne routes met lang-prefix */
function withLang(lang: string, path: string) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `/${lang}${clean}`;
}

export default function Footer() {
  const pathname = usePathname();
  const lang = getLangFromPath(pathname) || "en";
  const year = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 border-t border-border mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand / intro */}
          <section aria-label="About platform">
            <h2 className="text-lg font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              ABC Islands
            </h2>
            <p className="text-sm text-muted-foreground">
              Your gateway to discovering the beauty and culture of Aruba, Bonaire, and Curaçao.
            </p>
          </section>

          {/* Islands */}
          <nav aria-label="Islands">
            <h2 className="font-semibold mb-4 text-foreground">Islands</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={withLang(lang, "/islands/aruba")}
                  className="text-muted-foreground hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
                >
                  Aruba
                </Link>
              </li>
              <li>
                <Link
                  href={withLang(lang, "/islands/bonaire")}
                  className="text-muted-foreground hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
                >
                  Bonaire
                </Link>
              </li>
              <li>
                <Link
                  href={withLang(lang, "/islands/curacao")}
                  className="text-muted-foreground hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
                >
                  Curaçao
                </Link>
              </li>
              <li>
                <Link
                  href={withLang(lang, "/blog")}
                  className="text-muted-foreground hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
                >
                  Blog &amp; Guides
                </Link>
              </li>
            </ul>
          </nav>

          {/* For Business */}
          <nav aria-label="For business">
            <h2 className="font-semibold mb-4 text-foreground">For Business</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={withLang(lang, "/for-business")}
                  className="text-muted-foreground hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
                >
                  Why ABC Islands?
                </Link>
              </li>
              <li>
                <Link
                  href={withLang(lang, "/business/auth")}
                  className="text-muted-foreground hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
                >
                  Get Started
                </Link>
              </li>
            </ul>
          </nav>

          {/* Social / contact */}
          <section aria-label="Connect">
            <h2 className="font-semibold mb-4 text-foreground">Connect</h2>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-muted-foreground hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-muted-foreground hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="text-muted-foreground hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="mailto:info@guide-me-abc.com"
                aria-label="Email"
                className="text-muted-foreground hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </section>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {year} ABC Islands Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}