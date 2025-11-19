// app/[lang]/business/create/page.tsx
import { supabaseServer } from "@/lib/supabase/server";
import { isLocale, type Locale } from "@/i18n/config";
import { DICTS } from "@/i18n/dictionaries";
import CreateClient from "./ui/CreateClient";

type Params = {
  lang: string;
};

type PageProps = {
  params: Promise<Params>; // Next 15/16 param-Promise
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
};

export default async function CreateBusinessPage(props: PageProps) {
  const { lang: rawLang } = await props.params;
  const lang: Locale = isLocale(rawLang) ? rawLang : "en";

  const s = await supabaseServer();

  const { data: categories, error } = await s
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (error) {
    // Je kunt hier een error-pagina of fallback tonen
    console.error("[create] categories error:", error);
  }

  const t = DICTS[lang] ?? DICTS.en;

  return (
    <CreateClient
      lang={lang}
      categories={(categories ?? []) as CategoryRow[]}
      t={t}
    />
  );
}