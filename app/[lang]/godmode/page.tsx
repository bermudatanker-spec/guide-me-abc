// app/[lang]/godmode/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isLocale, type Locale } from "@/i18n/config";
import { requireSuperAdminServer } from "@/lib/auth/requireSuperAdminServer";
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

export const dynamic = "force-dynamic";

type Params = { lang: string };
type Props = { params: Params }; // ✅ FIX

export function generateMetadata({ params }: Props): Metadata {
  const raw = params.lang;
  const lang = isLocale(raw) ? (raw as Locale) : "en";
  const isNl = lang === "nl";

  return {
    title: "Super Admin | Guide Me ABC",
    description: isNl
      ? "God Mode – volledige controle over Guide Me ABC."
      : "God Mode – full control over Guide Me ABC.",
  };
}

export default async function GodmodePage({ params }: Props) {
  const raw = params.lang;
  const lang: Locale = isLocale(raw) ? (raw as Locale) : "en";
  const isNl = lang === "nl";

  // ✅ HARD GUARD (server-side)
  const guard = await requireSuperAdminServer();

  // ❗ In page.tsx ALTIJD redirect(), NOOIT NextResponse returnen
  if (!guard.ok) {
    redirect(`/${lang}/account?redirectedFrom=/${lang}/godmode`);
  }

  return (
    <main className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <section className="mb-10">
        <p className="text-sm font-semibold tracking-wide text-primary mb-2">
          GOD MODE
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          Super Admin Dashboard
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          {isNl
            ? "Welkom in God Mode – vanaf hier beheer je alles."
            : "Welcome to God Mode – from here you manage everything."}
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <GodCard
          href={`/${lang}/godmode/users`}
          accent="from-sky-700 via-sky-600 to-cyan-500"
          label={isNl ? "Gebruikers & rollen" : "Users & roles"}
          badge="God Mode"
          icon={<Users className="h-6 w-6" />}
          description={
            isNl
              ? "Bekijk accounts, pas rollen aan, blokkeer/activeer."
              : "View accounts, update roles, block/unblock."
          }
        />

        <GodCard
          href={`/${lang}/admin/businesses`}
          accent="from-blue-700 via-blue-600 to-cyan-500"
          label={isNl ? "Bedrijven beoordelen" : "Moderate businesses"}
          badge="Admin"
          icon={<Briefcase className="h-6 w-6" />}
          description={
            isNl
              ? "Approve/reject listings, status en pakketten."
              : "Approve/reject listings, status and plans."
          }
        />

        <GodCard
          href={`/${lang}/godmode/content`}
          accent="from-emerald-700 via-emerald-600 to-teal-500"
          label="Content & SEO"
          badge="Content"
          icon={<Globe2 className="h-6 w-6" />}
          description={
            isNl
              ? "Beheer categorieën en (later) SEO."
              : "Manage categories and (later) SEO."
          }
        />

        <GodCard
          href={`/${lang}/godmode/ai`}
          accent="from-purple-700 via-purple-600 to-fuchsia-500"
          label="AI & Travel Assistant"
          badge="AI"
          icon={<Sparkles className="h-6 w-6" />}
          description={isNl ? "AI instellingen en limieten." : "AI settings and limits."}
        />

        <GodCard
          href={`/${lang}/godmode/settings`}
          accent="from-slate-800 via-slate-700 to-slate-500"
          label={isNl ? "Platform & instellingen" : "Platform & settings"}
          badge="System"
          icon={<Settings className="h-6 w-6" />}
          description={
            isNl
              ? "Platform settings, features, onderhoud."
              : "Platform settings, features, maintenance."
          }
        />

        <GodCard
          href={`/${lang}/godmode/logs`}
          accent="from-amber-700 via-amber-600 to-orange-500"
          label={isNl ? "Activiteit & logs" : "Activity & logs"}
          badge="Monitoring"
          icon={<Activity className="h-6 w-6" />}
          description={isNl ? "Audit & logs overzicht." : "Audit & logs overview."}
        />

        <GodCard
          href={`/${lang}`}
          accent="from-cyan-700 via-sky-600 to-sky-400"
          label={isNl ? "Bekijk als toerist" : "View as tourist"}
          badge="Preview"
          icon={<Eye className="h-6 w-6" />}
          description={isNl ? "Publieke site preview." : "Public site preview."}
        />

        <GodCard
          href={`/${lang}/account`}
          accent="from-pink-700 via-rose-600 to-rose-500"
          label={isNl ? "Eigen account" : "Your account"}
          badge="Personal"
          icon={<UserCog className="h-6 w-6" />}
          description={isNl ? "Account info of uitloggen." : "Account details or sign out."}
        />
      </section>
    </main>
  );
}

type CardProps = {
  href: string;
  accent: string;
  label: string;
  badge: string;
  icon: ReactNode;
  description: string;
};

function GodCard({ href, accent, label, badge, icon, description }: CardProps) {
  return (
    <Link href={href} className="group">
      <article className="relative h-full overflow-hidden rounded-3xl border border-white/30 bg-gradient-to-br from-background/90 to-background/70 shadow-xl backdrop-blur-xl transition-transform duration-150 group-hover:-translate-y-1 group-hover:shadow-2xl">
        <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${accent}`} />
        <div className="p-6 sm:p-7 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {badge}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {icon}
            </div>
          </div>

          <h2 className="text-lg font-semibold tracking-tight mt-1">{label}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

          <div className="mt-3 text-sm font-medium text-primary group-hover:underline">
            → open
          </div>
        </div>
      </article>
    </Link>
  );
}