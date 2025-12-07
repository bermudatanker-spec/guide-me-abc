// app/[lang]/godmode/content/page.tsx
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { supabaseServer } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Params = { lang: Locale };
type Props = { params: Promise<Params> };

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = isLocale(raw) ? raw : "en";
  const isNl = lang === "nl";

  return {
    title: isNl
      ? "Content & SEO | God Mode"
      : "Content & SEO | God Mode",
    description: isNl
      ? "Beheer eilanden, categorieën en SEO-instellingen."
      : "Manage islands, categories and SEO settings.",
  };
}

export default async function GodmodeContentPage({ params }: Props) {
  const { lang: raw } = await params;
  const lang = isLocale(raw) ? raw : "en";
  const isNl = lang === "nl";

  const s = await supabaseServer();
  const { data, error } = await s
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true })
    .returns<CategoryRow[]>();

  const categories: CategoryRow[] = data ?? [];

  return (
    <main className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
          God Mode · Content
        </p>
        <h1 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight">
          {isNl ? "Content & SEO" : "Content & SEO"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm sm:text-base text-muted-foreground">
          {isNl
            ? "Hier beheer je de basisstructuur voor eilanden, categorieën en (later) SEO-instellingen."
            : "Manage the core structure for islands, categories and (later) SEO settings here."}
        </p>
      </header>

      {/* Eilanden-blok (placeholder voor later) */}
      <Card className="border-dashed border-primary/20 bg-gradient-to-br from-background via-background to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>{isNl ? "Eilanden content" : "Islands content"}</span>
            <Badge variant="outline" className="text-[11px]">
              {isNl ? "In voorbereiding" : "Coming soon"}
            </Badge>
          </CardTitle>
          <CardDescription>
            {isNl
              ? "Later kun je hier per eiland hero-secties, intro-teksten en uitgelichte hotspots beheren."
              : "Later you can manage island hero sections, intro copy and featured hotspots here."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-wrap gap-2 text-xs sm:text-sm text-muted-foreground">
            <li className="rounded-full bg-muted px-3 py-1">Aruba</li>
            <li className="rounded-full bg-muted px-3 py-1">Bonaire</li>
            <li className="rounded-full bg-muted px-3 py-1">Curaçao</li>
          </ul>
        </CardContent>
      </Card>

      {/* Categorieën – echt uit de DB */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isNl ? "Categorieën" : "Categories"}
          </CardTitle>
          <CardDescription>
            {isNl
              ? "Alle categorieën die bedrijven kunnen kiezen. Later kun je hier categorieën toevoegen, wijzigen en ordenen."
              : "All categories businesses can select. Later you can add, edit and reorder them here."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-sm text-destructive">
              {isNl
                ? `Fout bij laden van categorieën: ${error.message}`
                : `Error loading categories: ${error.message}`}
            </p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {isNl
                ? "Er zijn nog geen categorieën gevonden."
                : "No categories found yet."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border-separate border-spacing-y-1">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">
                      {isNl ? "Naam" : "Name"}
                    </th>
                    <th className="px-3 py-2">Slug</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr
                      key={c.id}
                      className="bg-muted/40 hover:bg-muted/70 transition-colors"
                    >
                      <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground align-top">
                        {c.id}
                      </td>
                      <td className="px-3 py-2 font-medium align-top">
                        {c.name}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground align-top">
                        {c.slug}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}