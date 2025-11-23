// app/[lang]/islands/[island]/[category]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const LANGS = ["en", "nl", "pap", "es"] as const;
const ISLANDS = ["aruba", "bonaire", "curacao"] as const;
const CATEGORIES = [
  "shops",
  "activities",
  "car-rentals",
  "restaurants",
  "services",
  "real-estate",
] as const;

type Lang = (typeof LANGS)[number];
type IslandId = (typeof ISLANDS)[number];
type CategoryId = (typeof CATEGORIES)[number];

export const dynamic = "force-dynamic"; // niets export-path gedoe
export const dynamicParams = true;

/* ---- STATIC PARAMS ---- */
export function generateStaticParams() {
  // *** BELANGRIJK: hier MOET lang, island én category zitten ***
  return LANGS.flatMap((lang) =>
    ISLANDS.flatMap((island) =>
      CATEGORIES.map((category) => ({
        lang,
        island,
        category,
      }))
    )
  );
}

/* ---- METADATA ---- */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang; island: IslandId; category: CategoryId }>;
}): Promise<Metadata> {
  const { lang, island, category } = await params;

  const niceCategory = category.replace("-", " ");
  const title = `${niceCategory} in ${island} | Guide Me ABC`;
  const description = `Browse ${niceCategory} in ${island} on Guide Me ABC.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/islands/${island}/${category}`,
    },
  };
}

/* ---- PAGE ---- */
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ lang: Lang; island: IslandId; category: CategoryId }>;
}) {
  const { lang, island, category } = await params;

  if (!LANGS.includes(lang)) notFound();
  if (!ISLANDS.includes(island)) notFound();
  if (!CATEGORIES.includes(category)) notFound();

  const niceCategory = category.replace("-", " ");

  return (
    <div className="min-h-screen pt-28 container mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl sm:text-4xl font-bold mb-3">
        {niceCategory} in {island.charAt(0).toUpperCase() + island.slice(1)}
      </h1>
      <p className="text-muted-foreground mb-8">
        Category page is working. Hier komen later de echte listings uit
        Supabase (gefilterd op eiland + categorie).
      </p>

      <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
        <p>
          Debug info: <strong>lang</strong> = {lang},{" "}
          <strong>island</strong> = {island},{" "}
          <strong>category</strong> = {category}
        </p>
      </div>
    </div>
  );
}
