// app/[lang]/business/auth/page.tsx
import type { Metadata } from "next";

import { isLocale, type Locale } from "@/i18n/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AuthClient from "./ui/AuthClient";

/* ---------- Types ---------- */

type PageParams = {
  lang: string;
};

type PageProps = {
  params: Promise<PageParams>;
};

type SettingRow = {
  key: string;
  value: string | null;
};

/* ---------- Helpers ---------- */

function asBool(value: unknown): boolean {
  // als het al een boolean is
  if (typeof value === "boolean") return value;

  // null / undefined → false
  if (value == null) return false;

  // numbers → 0 = false, andere = true
  if (typeof value === "number") return value !== 0;

  // strings → even normaliseren
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    return v === "true" || v === "1" || v === "yes" || v === "on";
  }

  // alles anders (object, array, etc.) → gewoon false
  return false;
}

/* ---------- Metadata ---------- */

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? (raw as Locale): "en";
  const isNl = lang === "nl";

  return {
    title: isNl
      ? "Ondernemers login – Guide Me ABC"
      : "Business login – Guide Me ABC",
    description: isNl
      ? "Log in of maak een account aan om je bedrijfsvermelding te beheren."
      : "Sign in or create an account to manage your business listing.",
  };
}

/* ---------- Page ---------- */

export default async function BusinessAuthPage({ params }: PageProps) {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "en";

  // LET OP: createSupabaseServerClient is async, dus we wachten erop
  const supabase = await createSupabaseServerClient();

  let allowRegistrations = true;
  let forceEmailVerification = true;

  try {
    const { data, error } = await supabase
      .from("platform_settings")
      .select("key, value")
      .in("key", ["allow_registrations", "force_email_verification"]);

    if (!error && data) {
      for (const row of data as SettingRow[]) {
        if (row.key === "allow_registrations") {
          allowRegistrations = asBool(row.value);
        }
        if (row.key === "force_email_verification") {
          forceEmailVerification = asBool(row.value);
        }
      }
    }
  } catch (e) {
    // fallback op defaults
    console.error("[business/auth] platform_settings load failed", e);
  }

  return (
    <AuthClient
      lang={lang}
      allowRegistrations={allowRegistrations}
      forceEmailVerification={forceEmailVerification}
    />
  );
}