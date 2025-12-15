import { isLocale, type Locale } from "@/i18n/config";
import { supabaseServer } from "@/lib/supabase/server";
import CreateBusinessForm from "./ui/CreateBusinessForm";

type Params = { lang: string };
type PageProps = { params: Promise<Params> };

export const dynamic = "force-dynamic";

type CategoryRow = { id: string; name: string; slug: string };

export default async function BusinessCreatePage({ params }: PageProps) {
  const { lang: rawLang } = await params;
  const lang: Locale = isLocale(rawLang) ? (rawLang as Locale) : "en";

  const supabase = await supabaseServer();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  return (
    <CreateBusinessForm
      lang={lang}
      categories={(categories ?? []) as CategoryRow[]}
    />
  );
}