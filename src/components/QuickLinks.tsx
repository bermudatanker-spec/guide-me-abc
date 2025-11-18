"use client";

import Link from "next/link";
import { MapPin, Store, Star, Newspaper } from "lucide-react";

const items = [
  { href: "/islands/aruba", label: "Aruba", icon: MapPin },
  { href: "/islands/bonaire", label: "Bonaire", icon: MapPin },
  { href: "/islands/curacao", label: "Curaçao", icon: MapPin },
  { href: "/businesses", label: "Businesses", icon: Store },
  { href: "/blog", label: "Blog", icon: Newspaper },
  { href: "/top-rated", label: "Top Rated", icon: Star },
] as const;

export default function QuickLinks() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {items.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="group inline-flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-sm shadow-sm transition-colors hover:bg-accent"
        >
          <Icon className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
          <span className="text-foreground">{label}</span>
        </Link>
      ))}
    </div>
  );
}