// app/[lang]/godmode/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { isLocale, type Locale } from "@/i18n/config";
import { supabaseServer } from "@/lib/supabase/server";
import { langHref } from "@/lib/lang-href";

import Link from "next/link";
import {
  Settings,
  Users,
  Briefcase,
  Globe2,
  Sparkles,
  Activity,
  Eye,
  UserCog,
} from "lucide-react";

// 👉 Deze route is altijd dynamisch (mag cookies/heades gebruiken)
export const dynamic = "force-dynamic";

type Params = { lang: string };
type Props = { params: Promise<Params> };

// ---------- SEO ----------
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = isLocale(raw) ? (raw as Locale) : "en";
  const isNl = lang === "nl";

  return {
    title: isNl ? "Super Admin | Guide Me ABC" : "Super Admin | Guide Me ABC",
    description: isNl
      ? "God Mode – volledige controle over Guide Me ABC."
      : "God Mode – full control over Guide Me ABC.",
  };
}

// ---------- PAGE ----------
export default async function GodmodePage({ params }: Props) {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? (raw as Locale) : "en";
  const isNl = lang === "nl";

  // 1) Ingelogde user ophalen
  const supabase = await supabaseServer();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("[godmode] auth error", error);
  }

  // 2) Niet ingelogd -> naar login
  if (!user) {
    console.log("[godmode] geen user → redirect naar business/auth");
    redirect(langHref(lang, "/business/auth"));
  }

  // 3) Rollen uit app_metadata halen (zowel `roles` als `role` ondersteunen)
  const meta = (user!.app_metadata ?? {}) as any;

  let rawRoles = meta.roles ?? meta.role ?? [];
  if (!Array.isArray(rawRoles) && rawRoles != null) {
    rawRoles = [rawRoles];
  }

  const rolesArr = Array.isArray(rawRoles)
    ? rawRoles
        .filter((r: any) => r != null)
        .map((r: any) => String(r).toLowerCase())
    : [];

  const isSuperAdmin =
    rolesArr.includes("super_admin") || rolesArr.includes("superadmin");

  console.log("[godmode] user id:", user!.id);
  console.log("[godmode] app_metadata:", meta);
  console.log("[godmode] rolesArr:", rolesArr);
  console.log("[godmode] isSuperAdmin:", isSuperAdmin);

  // 4) Geen super_admin? Wegsturen
  if (!isSuperAdmin) {
    console.log("[godmode] user is GEEN super_admin → redirect naar dashboard");
    redirect(langHref(lang, "/business/dashboard"));
  }

  // 5) Echte God Mode UI
  return (
    <main className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      {/* Header */}
      <section className="mb-10">
        <p className="text-sm font-semibold tracking-wide text-primary mb-2">
          GOD MODE
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          {isNl ? "Super Admin Dashboard" : "Super Admin Dashboard"}
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          {isNl
            ? "Welkom in God Mode – vanaf hier beheer je gebruikers, bedrijven, content, AI en alle platforminstellingen. Jij bepaalt."
            : "Welcome to God Mode – from here you manage users, businesses, content, AI and all platform settings. You are in control."}
        </p>
      </section>

      {/* GRID */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* 1. Users & Roles */}
        <GodCard
          href={`/${lang}/godmode/users`}
          accent="from-sky-700 via-sky-600 to-cyan-500"
          label={isNl ? "Gebruikers & rollen" : "Users & roles"}
          badge="God Mode"
          icon={<Users className="h-6 w-6" />}
          description={
            isNl
              ? "Bekijk alle accounts, pas rollen aan en blokkeer of activeer gebruikers."
              : "View all accounts, change roles and block or activate users."
          }
        />

        {/* 2. Businesses moderation */}
        <GodCard
          href={`/${lang}/admin/businesses`}
          accent="from-blue-700 via-blue-600 to-cyan-500"
          label={isNl ? "Bedrijven beoordelen" : "Moderate businesses"}
          badge={isNl ? "Admin" : "Admin"}
          icon={<Briefcase className="h-6 w-6" />}
          description={
            isNl
              ? "Keur nieuwe bedrijfsvermeldingen goed of af en beheer status en pakketten."
              : "Approve or reject new business listings and manage status and plans."
          }
        />

        {/* 3. Content & SEO */}
        <GodCard
          href={`/${lang}/godmode/content`}
          accent="from-emerald-700 via-emerald-600 to-teal-500"
          label={isNl ? "Content & SEO" : "Content & SEO"}
          badge={isNl ? "Content" : "Content"}
          icon={<Globe2 className="h-6 w-6" />}
          description={
            isNl
              ? "Beheer eilanden, categorieën, highlights en SEO-instellingen voor de hele site."
              : "Manage islands, categories, highlights and global SEO settings."
          }
        />

        {/* 4. AI / Travel assistant */}
        <GodCard
          href={`/${lang}/godmode/ai`}
          accent="from-purple-700 via-purple-600 to-fuchsia-500"
          label={isNl ? "AI & Travel Assistant" : "AI & Travel Assistant"}
          badge="AI"
          icon={<Sparkles className="h-6 w-6" />}
          description={
            isNl
              ? "Configureer AI-antwoordregels, premiumvragen en toegang voor ingelogde gebruikers."
              : "Configure AI behaviour, premium questions and access for logged-in users."
          }
        />

        {/* 5. Platform & settings */}
        <GodCard
          href={`/${lang}/godmode/settings`}
          accent="from-slate-800 via-slate-700 to-slate-500"
          label={isNl ? "Platform & instellingen" : "Platform & settings"}
          badge={isNl ? "Systeem" : "System"}
          icon={<Settings className="h-6 w-6" />}
          description={
            isNl
              ? "Beheer abonnementen, limieten, beta-features en onderhoudsmodus."
              : "Manage subscriptions, limits, beta features and maintenance mode."
          }
        />

        {/* 6. Logs & monitoring */}
        <GodCard
          href={`/${lang}/godmode/logs`}
          accent="from-amber-700 via-amber-600 to-orange-500"
          label={isNl ? "Activiteit & logs" : "Activity & logs"}
          badge={isNl ? "Monitoring" : "Monitoring"}
          icon={<Activity className="h-6 w-6" />}
          description={
            isNl
              ? "Bekijk belangrijke acties, moderatiegeschiedenis en foutmeldingen."
              : "Review important actions, moderation history and error events."
          }
        />

        {/* 7. Preview as tourist */}
        <GodCard
          href={`/${lang}`}
          accent="from-cyan-700 via-sky-600 to-sky-400"
          label={isNl ? "Bekijk als toerist" : "View as tourist"}
          badge={isNl ? "Preview" : "Preview"}
          icon={<Eye className="h-6 w-6" />}
          description={
            isNl
              ? "Open de publieke site zoals een toerist of local die ziet."
              : "Open the public site exactly as tourists and locals see it."
          }
        />

        {/* 8. Your own account */}
        <GodCard
          href={`/${lang}/account`}
          accent="from-pink-700 via-rose-600 to-rose-500"
          label={isNl ? "Eigen account" : "Your account"}
          badge={isNl ? "Persoonlijk" : "Personal"}
          icon={<UserCog className="h-6 w-6" />}
          description={
            isNl
              ? "Pas je naam en gegevens aan of log uit als Super Admin."
              : "Update your own details or sign out as Super Admin."
          }
        />
      </section>
    </main>
  );
}

// ---------- Reusable card component ----------
type CardProps = {
  href: string;
  accent: string; // tailwind gradient classes
  label: string;
  badge: string;
  icon: ReactNode;
  description: string;
};

function GodCard({ href, accent, label, badge, icon, description }: CardProps) {
  return (
    <Link href={href} className="group">
      <article className="relative h-full overflow-hidden rounded-3xl border border-white/30 bg-gradient-to-br from-background/90 to-background/70 shadow-xl backdrop-blur-xl transition-transform duration-150 group-hover:-translate-y-1 group-hover:shadow-2xl">
        {/* Accent strip */}
        <div
          className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${accent}`}
        />

        <div className="p-6 sm:p-7 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {badge}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {icon}
            </div>
          </div>

          <h2 className="text-lg font-semibold tracking-tight mt-1">
            {label}
          </h2>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>

          <div className="mt-3 text-sm font-medium text-primary group-hover:underline">
            → open
          </div>
        </div>
      </article>
    </Link>
  );
}