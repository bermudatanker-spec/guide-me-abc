"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { langHref } from "@/lib/lang-href";
import { cn } from "@/lib/utils";

type MainNavProps = {
  lang: string;
};

const links = [
  {
    href: "/",
    label: { nl: "Home", en: "Home" },
  },
  {
    href: "/islands/aruba",
    label: { nl: "Aruba", en: "Aruba" },
  },
  {
    href: "/islands/bonaire",
    label: { nl: "Bonaire", en: "Bonaire" },
  },
  {
    href: "/islands/curacao",
    label: { nl: "Curaçao", en: "Curaçao" },
  },
  {
    href: "/for-business",
    label: { nl: "Voor bedrijven", en: "For business" },
  },
];

export function MainNav({ lang }: MainNavProps) {
  const pathname = usePathname() ?? "/";

  const t = (nl: string, en: string) => (lang === "nl" ? nl : en);

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / title */}
        <Link
          href={langHref(lang, "/")}
          className="font-semibold tracking-tight text-lg"
        >
          Guide Me ABC
        </Link>

        {/* Main links */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          {links.map((link) => {
            const href = langHref(lang, link.href);
            const isActive =
              pathname === href ||
              (href !== "/" && pathname.startsWith(href));

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "transition-colors hover:text-primary",
                  isActive ? "text-primary font-medium" : "text-foreground/80"
                )}
              >
                {t(link.label.nl, link.label.en)}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}