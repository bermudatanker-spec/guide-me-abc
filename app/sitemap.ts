// app/sitemap.ts
import { LOCALES } from "@/i18n/config";

const BASE_URL =
 process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

const STATIC_PATHS = [
 "/",
 "/islands",
 "/islands/aruba",
 "/islands/bonaire",
 "/islands/curacao",
 "/businesses",
 "/blog",
 "/faq",
];

type SitemapEntry = {
 url: string;
 lastModified?: Date;
 changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
 priority?: number;
 alternates?: { languages: Record<string, string> };
};

export default function sitemap(): SitemapEntry[] {
 const entries: SitemapEntry[] = [];

 for (const lang of LOCALES) {
 for (const path of STATIC_PATHS) {
 const pathWithLang = path === "/" ? `/${lang}` : `/${lang}${path}`;
 const url = `${BASE_URL}${pathWithLang}`;

 const languages = Object.fromEntries(
 LOCALES.map((l) => [
 l,
 `${BASE_URL}${path === "/" ? `/${l}` : `/${l}${path}`}`,
 ])
 );

 entries.push({
 url,
 lastModified: new Date(),
 alternates: { languages },
 });
 }
 }

 return entries;
}