"use client";

import ResponsiveImage from "@/components/ResponsiveImage";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export type Island = {
  id: "aruba" | "bonaire" | "curacao";
  name: string;
  tagline: string;
  description: string;
  image: string;
  highlights: string[];
};

export default function IslandCard(props: Island) {
  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md">
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

        <ul className="mt-4 list-disc pl-5 space-y-1 text-sm text-muted-foreground">
          {props.highlights.slice(0, 4).map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>

        <div className="mt-5">
          <Link
            href={`/islands/${props.id}`}
            className="inline-flex items-center gap-1 text-primary hover:underline"
            aria-label={`Explore ${props.name}`}
          >
            Explore {props.name}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}