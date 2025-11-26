// app/[lang]/businesses/page.tsx
import { isLocale, type Locale } from "@/i18n/config";
import { supabaseServer } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import BusinessMenu from "@/components/BusinessMenu";

type Params = { params: { lang: Locale } };

// ✨ Type precies wat je ophaalt
type Row = {
  id: string;
  business_name: string;
  description: string | null;
  island: "aruba" | "bonaire" | "curacao";
  category_id: number | null; // bigint in DB → number in TS
  categories: { name: string; slug: string } | null; // alias in select
  logo_url: string | null;
  cover_image_url: string | null;
  subscription_plan: "starter" | "growth" | "pro" | null;
};

export default async function BusinessesPage({ params }: Params) {
  const lang = isLocale(params.lang) ? params.lang : "en";
  const s = await supabaseServer();

  const { data, error } = await s
    .from("business_listings")
    .select(
      `
      id,
      business_name,
      description,
      island,
      category_id,
      categories:category_id ( name, slug ),
      logo_url,
      cover_image_url,
      subscription_plan
    `
    )
    .eq("status", "active")
    .order("business_name", { ascending: true })
    .returns<Row[]>(); // ✅ laat Supabase de shape bevestigen

  const listings: Row[] = data ?? [];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-foreground">
          {lang === "nl"
            ? "Ontdek Bedrijven"
            : lang === "pap"
            ? "Deskubri Negoshinan"
            : lang === "es"
            ? "Descubre Negocios"
            : "Discover Businesses"}
        </h1>
        <p className="text-muted-foreground">
          {lang === "nl"
            ? "Browse lokale bedrijven op de ABC-eilanden"
            : lang === "pap"
            ? "Eksplora negoshinan lokal riba e Islanan ABC"
            : lang === "es"
            ? "Explora negocios locales en las Islas ABC"
            : "Browse local businesses across the ABC Islands"}
        </p>
      </div>

      {error ? (
        <p className="text-destructive">Error: {error.message}</p>
      ) : listings.length === 0 ? (
        <p className="text-muted-foreground">No active businesses published yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((b) => {
            const isPro = (b.subscription_plan ?? "") === "pro";
            const href = isPro ? `/${lang}/biz/${b.id}` : undefined;
            return (
              <Card key={b.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {b.logo_url && (
                    <div className="mb-4 h-32 flex items-center justify-center bg-muted rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={b.logo_url}
                        alt={b.business_name}
                        className="max-h-full max-w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-foreground">{b.business_name}</h3>
                    {isPro && <Badge className="bg-primary text-primary-foreground">Pro</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    {cap(b.island)} • {b.categories?.name ?? "—"}
                  </div>
                  {b.description && (
                    <p className="text-sm text-foreground/80 mb-4 line-clamp-2">{b.description}</p>
                  )}
                  <Button
                    variant={isPro ? "outline" : "ghost"}
                    size="sm"
                    className="w-full"
                    disabled={!isPro}
                    asChild={isPro}
                  >
                    {isPro ? (
                      <Link href={href!}>
                        {lang === "nl" ? "Bekijk details" : "View details"}
                      </Link>
                    ) : (
                      <span>{lang === "nl" ? "Geen mini-site" : "No mini-site"}</span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}