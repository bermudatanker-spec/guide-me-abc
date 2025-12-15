// app/[lang]/business/create/page.tsx
import { isLocale, type Locale } from "@/i18n/config";
import { supabaseServer } from "@/lib/supabase/server";
import CreateClient from "./ui/CreateClient";

type Params = { lang: string };
type PageProps = { params: Promise<Params> };

export const dynamic = "force-dynamic";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
};

export default async function BusinessCreatePage({ params }: PageProps) {
  const { lang: rawLang } = await params;
  const lang: Locale = isLocale(rawLang) ? (rawLang as Locale) : "en";

  const supabase = await supabaseServer();

  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  // simpele fallback translations (mag je later vervangen door echte i18n)
  const t: Record<string, string> =
    lang === "nl"
      ? {
          backToDashboard: "Terug naar dashboard",
          businessCreateTitle: "Nieuw bedrijf",
          businessCreateSubtitle:
            "Registreer je bedrijf om gevonden te worden op de ABC-eilanden.",
          businessName: "Bedrijfsnaam",
          island: "Eiland",
          selectIsland: "Kies een eiland",
          category: "Categorie",
          none: "— Geen —",
          description: "Beschrijving",
          descriptionPlaceholder: "Vertel iets over je bedrijf…",
          address: "Adres",
          phone: "Telefoon",
          email: "E-mailadres",
          website: "Website",
          createBusinessCta: "Bedrijf aanmaken",
          error: "Fout",
          missingRequired: "Verplichte velden ontbreken",
          fillRequired: "Vul minimaal een bedrijfsnaam en het eiland in.",
          created: "Bedrijf aangemaakt",
          addFirstBusiness: "Je bedrijf is aangemaakt en wordt gecontroleerd.",
          saveError: "Er ging iets mis bij het opslaan van je bedrijf.",
        }
      : {
          backToDashboard: "Back to dashboard",
          businessCreateTitle: "New business",
          businessCreateSubtitle:
            "Register your business to be found on the ABC islands.",
          businessName: "Business name",
          island: "Island",
          selectIsland: "Select an island",
          category: "Category",
          none: "— None —",
          description: "Description",
          descriptionPlaceholder: "Tell something about your business…",
          address: "Address",
          phone: "Phone",
          email: "Email",
          website: "Website",
          createBusinessCta: "Create business",
          error: "Error",
          missingRequired: "Missing required fields",
          fillRequired: "Please provide at least a business name and island.",
          created: "Business created",
          addFirstBusiness: "Your business was created and will be reviewed.",
          saveError: "Something went wrong while saving your business.",
        };

  return (
    <CreateClient
      lang={lang}
      t={t}
      categories={((!error ? categories : []) ?? []) as CategoryRow[]}
    />
  );
}