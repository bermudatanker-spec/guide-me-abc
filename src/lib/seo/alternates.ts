import type { Locale } from "@/i18n/config";

/**
 * Build a Metadata alternates.languages map for Next.js
 */
export function buildLanguageAlternates(
  locales: readonly Locale[],
  basePath: string = ""
): Record<string, string> {
  const cleaned =
    basePath === "/" || basePath.trim() === ""
      ? ""
      : basePath.startsWith("/")
        ? basePath
        : `/${basePath}`;

  return Object.fromEntries(locales.map((l) => [l, `/${l}${cleaned}`]));
}

/**
 * OPTIONAL: adds x-default for Google SEO
 * Only needed if you explicitly want x-default
 */
export function buildLanguageAlternatesWithDefault(
  locales: readonly Locale[],
  basePath: string = "",
  defaultLocale: Locale = "en"
): Record<string, string> {
  const map = buildLanguageAlternates(locales, basePath);

  return {
    "x-default": `/${defaultLocale}${
      basePath && basePath !== "/"
        ? basePath.startsWith("/")
          ? basePath
          : `/${basePath}`
        : ""
    }`,
    ...map,
  };
}