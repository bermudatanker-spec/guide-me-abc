import { supabaseServer } from "@/lib/supabase/server";

type Params = { params: { lang: "en" | "nl" | "pap" | "es" } };
type CategoryRow = { id: number; name: string; slug: string };

import CreateClient from "./ui/CreateClient";

export default async function CreateBusinessPage({ params }: Params) {
 const lang = params.lang ?? "en";
 const s = await supabaseServer();

 // Categorieën server-side ophalen en doorgeven
 const { data: categories = [] } = await s
 .from("categories")
 .select("id,name,slug")
 .order("name", { ascending: true });

 // (Eenvoudige) labels – vervang later evt. door je DICTS
 const t = {
 businessCreateTitle: lang === "nl" ? "Nieuw Bedrijf" : "New Business",
 businessCreateSubtitle:
 lang === "nl" ? "Vul de gegevens hieronder in." : "Fill in the details below.",
 backToDashboard: lang === "nl" ? "Terug naar Dashboard" : "Back to Dashboard",
 businessName: lang === "nl" ? "Bedrijfsnaam" : "Business name",
 island: lang === "nl" ? "Eiland" : "Island",
 category: lang === "nl" ? "Categorie" : "Category",
 selectIsland: lang === "nl" ? "Selecteer eiland" : "Select island",
 selectCategory: lang === "nl" ? "Selecteer categorie" : "Select category",
 description: lang === "nl" ? "Beschrijving" : "Description",
 descriptionPlaceholder:
 lang === "nl" ? "Vertel iets over je bedrijf…" : "Tell us about your business…",
 address: lang === "nl" ? "Adres" : "Address",
 phone: lang === "nl" ? "Telefoon" : "Phone",
 email: "E-mail",
 website: "Website",
 createBusinessCta: lang === "nl" ? "Opslaan" : "Save",
 };

 return <CreateClient lang={lang} categories={categories as CategoryRow[]} t={t} />;
}