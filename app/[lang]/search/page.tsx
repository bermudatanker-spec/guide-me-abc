import type { Locale } from "@/i18n/config";
import SearchResultsClient from "./ui/SearchResultsClient";

type Island = "all" | "aruba" | "bonaire" | "curacao";

// In Next 16 zijn params & searchParams altijd Promises
type PageProps = {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ q?: string; island?: string }>;
};

export default async function SearchPage({
  params,
  searchParams,
}: PageProps) {
  // ✅ Verplichte await voor Next 16 stabiliteit
  const p = await params;
  const sp = await searchParams;

  const lang = (p.lang ?? "nl") as Locale;
  const q = (sp.q ?? "").toString();

  const islandRaw = (sp.island ?? "all").toString();
  const island: Island =
    islandRaw === "aruba" || islandRaw === "bonaire" || islandRaw === "curacao"
      ? islandRaw
      : "all";

  // ✅ Niets gewijzigd aan de return of de props voor de client component
  return <SearchResultsClient lang={lang} q={q} island={island} />;
}