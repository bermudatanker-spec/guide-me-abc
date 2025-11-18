// src/i18n/config.ts
export const LOCALES = ["en", "nl", "pap", "es"] as const;
export type Locale = typeof LOCALES[number];
export const DEFAULT_LOCALE: Locale = "en";

export const isLocale = (x: unknown): x is Locale =>
  typeof x === "string" && (LOCALES as readonly string[]).includes(x);