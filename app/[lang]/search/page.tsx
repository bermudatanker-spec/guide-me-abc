// app/[lang]/search/page.tsx
import type { Locale } from "@/i18n/config";
import SearchResultsClient from "./ui/SearchResultsClient";

type Island = "all" | "aruba" | "bonaire" | "curacao";

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: Locale }> | { lang: Locale };
  searchParams: Promise<{ q?: string; island?: string }> | { q?: string; island?: string };
}) {
  const p = await Promise.resolve(params);
  const sp = await Promise.resolve(searchParams);

  const lang = (p.lang ?? "nl") as Locale;
  const q = (sp.q ?? "").toString();

  const islandRaw = (sp.island ?? "all").toString();
  const island: Island =
    islandRaw === "aruba" || islandRaw === "bonaire" || islandRaw === "curacao"
      ? islandRaw
      : "all";

  return <SearchResultsClient lang={lang} q={q} island={island} />;
}