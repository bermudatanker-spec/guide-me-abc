"use client";

import { useActionState } from "react";
import type { Locale } from "@/i18n/config";
import { createBusinessAction } from "../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type State = { error?: string };

type CategoryRow = { id: string; name: string; slug: string };

export default function CreateBusinessForm({
  lang,
  categories,
}: {
  lang: Locale;
  categories: CategoryRow[];
}) {
  const [state, action, pending] = useActionState<State, FormData>(
    (prev, fd) => createBusinessAction(lang, prev, fd),
    {}
  );

  return (
    <main className="container mx-auto px-4 py-16">
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Maak je bedrijf aan</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {state.error ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
              {state.error}
            </div>
          ) : null}

          <form action={action} className="space-y-4">
            <label className="block text-sm">
              Bedrijfsnaam
              <input
                name="name"
                className="mt-1 w-full rounded-xl border bg-background px-3 py-2"
                placeholder="Bijv. Aruba Car Rentals"
                required
              />
            </label>

            <label className="block text-sm">
              Eiland
              <select
                name="island"
                className="mt-1 w-full rounded-xl border bg-background px-3 py-2"
                defaultValue=""
                required
              >
                <option value="" disabled>
                  Kies…
                </option>
                <option value="aruba">Aruba</option>
                <option value="bonaire">Bonaire</option>
                <option value="curacao">Curaçao</option>
              </select>
            </label>

            <label className="block text-sm">
              Categorie
              <select
                name="category_id"
                className="mt-1 w-full rounded-xl border bg-background px-3 py-2"
                defaultValue=""
                required
              >
                <option value="" disabled>
                  Kies een categorie…
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Bezig..." : "Aanmaken"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}