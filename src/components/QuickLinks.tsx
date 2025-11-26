"use client";

import Link from "next/link";
import { MapPin, Store, Star, Newspaper } from "lucide-react";
import type { Locale } from "@/i18n/config";

const items = [
  { href: "/islands/aruba", label: { nl: "Aruba", en: "Aruba" }, icon: MapPin },
  { href: "/islands/bonaire", label: { nl: "Bonaire", en: "Bonaire" }, icon: MapPin },
  { href: "/islands/curacao", label: { nl: "Curaçao", en: "Curaçao" }, icon: MapPin },
  {
    href: "/businesses",
    label: { nl: "Bedrijven", en: "Businesses" },
    icon: Store,
  },
  { href: "/blog", label: { nl: "Blog", en: "Blog" }, icon: Newspaper },
  {
    href: "/top-rated",
    label: { nl: "Top Rated", en: "Top Rated" },
    icon: Star,
  },
] as const;

type Props = {
  lang: Locale;
};

export default function QuickLinks({ lang }: Props) {
  // alles behalve nl tonen we gewoon in EN
  const pickLabel = (label: { nl: string; en: string }) =>
    lang === "nl" ? label.nl : label.en;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {items.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={`/${lang}${href}`}
          className="group inline-flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-sm shadow-sm transition-colors hover:bg-accent"
        >
          <Icon className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
          <span className="text-foreground">{pickLabel(label)}</span>
        </Link>
      ))}
    </div>
  );
}