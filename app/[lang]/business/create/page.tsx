// app/[lang]/business/create/page.tsx
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { supabaseServer } from "@/lib/supabase/server"; // << aanpassen als jouw helper anders heet
import CreateClient from "./ui/CreateClient";

type Params = {
  lang: Locale;
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
};

/* ---------- Copy / vertalingen voor CreateClient ---------- */

const COPY: Record<Locale, Record<string, string>> = {
  en: {
    backToDashboard: "Back to dashboard",
    businessCreateTitle: "Create a new business",
    businessCreateSubtitle:
      "Register your business to be discovered on the ABC Islands.",
    businessName: "Business name",
    island: "Island",
    selectIsland: "Select an island",
    category: "Category",
    none: "— None —",
    description: "Description",
    descriptionPlaceholder: "Tell something about your business…",
    address: "Address",
    phone: "Phone",
    email: "Email address",
    website: "Website",
    createBusinessCta: "Create business",
    created: "Business created",
    addFirstBusiness: "Your business was created and will be reviewed.",
    error: "Error",
    saveError: "Something went wrong while saving your business.",
    missingRequired: "Required fields are missing",
    fillRequired:
      "Please provide at least a business name and island.",
  },
  nl: {
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
    created: "Bedrijf aangemaakt",
    addFirstBusiness:
      "Je bedrijf is aangemaakt en wordt gecontroleerd.",
    error: "Fout",
    saveError:
      "Er ging iets mis bij het opslaan van je bedrijf.",
    missingRequired: "Verplichte velden ontbreken",
    fillRequired:
      "Vul minimaal een bedrijfsnaam en het eiland in.",
  },
  pap: {
    backToDashboard: "Bèk na dashboard",
    businessCreateTitle: "Krea un negoshi nobo",
    businessCreateSubtitle:
      "Registra bo negoshi pa wordu hañá riba islanan ABC.",
    businessName: "Nòmber di negoshi",
    island: "Island",
    selectIsland: "Skohe un island",
    category: "Kategoria",
    none: "— Ningun —",
    description: "Deskripshon",
    descriptionPlaceholder: "Konta algu tokante bo negoshi…",
    address: "Adres",
    phone: "Telefoon",
    email: "Email-adres",
    website: "Website",
    createBusinessCta: "Krea negoshi",
    created: "Negoshi a wordu krea",
    addFirstBusiness:
      "Bo negoshi a wordu krea i lo wordu revisá.",
    error: "Eror",
    saveError:
      "Algu a bai malu mientras ta wardando bo negoshi.",
    missingRequired: "Informashon obligatorio ta falta",
    fillRequired:
      "Por fabor yena minimo nòmber di negoshi i island.",
  },
  es: {
    backToDashboard: "Volver al panel",
    businessCreateTitle: "Nuevo negocio",
    businessCreateSubtitle:
      "Registra tu negocio para que te encuentren en las islas ABC.",
    businessName: "Nombre del negocio",
    island: "Isla",
    selectIsland: "Elige una isla",
    category: "Categoría",
    none: "— Ninguna —",
    description: "Descripción",
    descriptionPlaceholder: "Cuenta algo sobre tu negocio…",
    address: "Dirección",
    phone: "Teléfono",
    email: "Correo electrónico",
    website: "Sitio web",
    createBusinessCta: "Crear negocio",
    created: "Negocio creado",
    addFirstBusiness:
      "Tu negocio ha sido creado y será revisado.",
    error: "Error",
    saveError:
      "Algo salió mal al guardar tu negocio.",
    missingRequired: "Faltan campos obligatorios",
    fillRequired:
      "Indica al menos un nombre de negocio y la isla.",
  },
} as const;

/* ---------- Metadata ---------- */

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = isLocale(raw) ? raw : "en";

  const title =
    lang === "nl"
      ? "Nieuw bedrijf aanmaken | Guide Me ABC"
      : "Create a new business | Guide Me ABC";

  const description =
    lang === "nl"
      ? "Registreer je bedrijf en laat je vinden door toeristen op Aruba, Bonaire & Curaçao."
      : "Register your business and get discovered by tourists on Aruba, Bonaire & Curaçao.";

  const languages = {
    en: "/en/business/create",
    nl: "/nl/business/create",
    pap: "/pap/business/create",
    es: "/es/business/create",
  } satisfies Record<string, string>;

  return {
    title,
    description,
    alternates: {
      languages,
    } as Metadata["alternates"],
    openGraph: {
      title,
      description,
      url: `/${lang}/business/create`,
    },
  };
}

/* ---------- Page (server) ---------- */

export default async function BusinessCreatePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { lang: raw } = await params;
  const lang = isLocale(raw) ? raw : "en";

  const t = COPY[lang] ?? COPY.en;

  // Supabase server-client
  const supabase = supabaseServer();

  const { data: categoriesData, error } = await supabase
    .from("categories") // <— als jouw tabel anders heet, hier aanpassen
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (error) {
    console.error("[business/create] categories error:", error.message);
  }

  const categories: CategoryRow[] = categoriesData ?? [];

  return (
    <CreateClient
      lang={lang}
      t={t}
      categories={categories}
    />
  );
}