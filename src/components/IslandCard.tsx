"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";

import ResponsiveImage from "@/components/ResponsiveImage";
import { trackClick } from "@/lib/track/trackClick";
import type { Locale } from "@/i18n/config";

export type Island = {
  id: "aruba" | "bonaire" | "curacao";
  name: string;
  tagline: string;
  description: string;
  image: string;
  highlights: string[];
};

type Props = Island & {
  lang: Locale;
};

export default function IslandCard({ lang, ...props }: Props) {
  const pathname = usePathname();
  const href = `/${lang}/islands/${props.id}`;

  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="relative h-48 w-full">
        <ResponsiveImage
          src={props.image}
          alt={props.name}
          sizes="(max-width:768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-foreground">{props.name}</h3>
        <p className="text-sm text-muted-foreground">{props.tagline}</p>

        <p className="mt-3 text-sm text-muted-foreground">{props.description}</p>

        <ul className="mt-4 space-y-1 list-disc pl-5 text-sm text-muted-foreground">
          {props.highlights.slice(0, 4).map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>

        <div className="mt-5">
          <Link
            href={href}
            onClick={() => {
              void trackClick({
                businessId: `island:${props.id}`, // pseudo-id voor islands
                eventType: "route",
                path: pathname,
                lang,
                island: props.id,
              });
            }}
            className="
              inline-flex items-center gap-1 text-sm font-semibold
              px-4 py-2 rounded-full
              bg-ocean-btn text-white shadow-glow
              transition hover:opacity-95
            "
          >
            {lang === "nl" ? `Ontdek ${props.name}` : `Explore ${props.name}`}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}