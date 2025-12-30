// app/[lang]/admin/page.tsx
import React from "react";
import Link from "next/link";

type Locale = "nl" | "en";

export default function AdminHomePage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = React.use(params);
  const isNl = lang === "nl";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isNl ? "Kies een sectie." : "Choose a section."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href={`/${lang}/admin/businesses`}
          className="rounded-xl border p-5 hover:bg-muted/40"
        >
          <div className="text-lg font-semibold">
            {isNl ? "Bedrijven beheren" : "Manage businesses"}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            {isNl
              ? "Abonnementen instellen: free / starter / growth / pro."
              : "Set subscriptions: free / starter / growth / pro."}
          </div>
        </Link>

        <Link
          href={`/${lang}/godmode/users`}
          className="rounded-xl border p-5 hover:bg-muted/40"
        >
          <div className="text-lg font-semibold">
            {isNl ? "Gebruikersbeheer" : "User management"}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            {isNl ? "Rollen beheren en blokkeren." : "Manage roles and blocks."}
          </div>
        </Link>
      </div>
    </div>
  );
}