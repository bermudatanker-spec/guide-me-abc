// app/_lib/getLangFromParams.ts
export type Lang = "en" | "nl" | "pap" | "es";
export async function getLangFromParams(params: Promise<{ lang: Lang }>): Promise<Lang> {
  const { lang } = await params;
  return (["en","nl","pap","es"] as const).includes(lang) ? lang : "en";
}