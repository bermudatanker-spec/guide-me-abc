// app/[lang]/business/create/ui/CreateClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

import { supabaseBrowser } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { langHref } from "@/lib/lang-href";
import { getLangFromPath } from "@/lib/locale-path";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/** Type moet aansluiten op je Supabase `categories` tabel */
type CategoryRow = {
  id: string;
  name: string;
  slug: string;
};

type CreateClientProps = {
  lang: string;
  categories: CategoryRow[];
  t: Record<string, string>;
};

export default function CreateClient({ lang, categories, t }: CreateClientProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const resolvedLang = getLangFromPath(pathname) || (lang as string);

  const supabase = useMemo(() => supabaseBrowser(), []);
  const { toast } = useToast();

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    business_name: "",
    island: "",
    category_id: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    whatsapp: "",
  });

  /** ------------------ Auth check (mag alleen ingelogd) ------------------ */
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.replace(langHref(resolvedLang, "/business/auth"));
      }
    })();
  }, [resolvedLang, router, supabase]);

  /** ------------------------- Submit handler ------------------------- */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.business_name || !form.island) {
      toast({
        title: t.missingRequired ?? "Verplichte velden ontbreken",
        description:
          t.fillRequired ??
          "Vul minimaal een bedrijfsnaam en het eiland in.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase.from("business_listings").insert({
        business_name: form.business_name,
        island: form.island,
        category_id: form.category_id || null,
        description: form.description || null,
        address: form.address || null,
        phone: form.phone || null,
        email: form.email || null,
        website: form.website || null,
        whatsapp: form.whatsapp || null,
        // status & subscription_plan kun je hier later ook zetten
      });

      if (error) throw new Error(error.message);

      toast({
        title: t.created ?? "Bedrijf aangemaakt",
      });

      router.replace(langHref(resolvedLang, "/business/dashboard"));
    } catch (err: any) {
      toast({
        title: t.error ?? "Fout",
        description:
          err?.message ??
          t.saveError ??
          "Er ging iets mis bij het opslaan van je bedrijf.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  /** ------------------------------ UI ------------------------------ */
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() =>
          router.push(langHref(resolvedLang, "/business/dashboard"))
        }
      >
        {/* eventueel ArrowLeft icoon gebruiken */}
        {t.backToDashboard ?? "Terug naar dashboard"}
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{t.businessCreateTitle ?? "Nieuw bedrijf"}</CardTitle>
          <CardDescription>
            {t.businessCreateSubtitle ??
              "Registreer je bedrijf om gevonden te worden op de ABC-eilanden."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bedrijfsnaam */}
            <div className="space-y-2">
              <Label htmlFor="business_name">
                {t.businessName ?? "Bedrijfsnaam"} *
              </Label>
              <Input
                id="business_name"
                value={form.business_name}
                onChange={(e) =>
                  setForm((s) => ({ ...s, business_name: e.target.value }))
                }
                required
              />
            </div>

            {/* Eiland + Categorie */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="island">{t.island ?? "Eiland"} *</Label>
                <select
                  id="island"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={form.island}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, island: e.target.value }))
                  }
                  required
                >
                  <option value="" disabled>
                    {t.selectIsland ?? "Kies een eiland"}
                  </option>
                  <option value="aruba">Aruba</option>
                  <option value="bonaire">Bonaire</option>
                  <option value="curacao">Curaçao</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category_id">
                  {t.category ?? "Categorie"}
                </Label>
                <select
                  id="category_id"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={form.category_id}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, category_id: e.target.value }))
                  }
                >
                  <option value="">
                    {t.none ?? "— Geen —"}
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Beschrijving */}
            <div className="space-y-2">
              <Label htmlFor="description">
                {t.description ?? "Beschrijving"}
              </Label>
              <Textarea
                id="description"
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm((s) => ({ ...s, description: e.target.value }))
                }
                placeholder={
                  t.descriptionPlaceholder ??
                  "Vertel iets over je bedrijf…"
                }
              />
            </div>

            {/* Adres */}
            <div className="space-y-2">
              <Label htmlFor="address">{t.address ?? "Adres"}</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) =>
                  setForm((s) => ({ ...s, address: e.target.value }))
                }
              />
            </div>

            {/* Telefoon & WhatsApp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{t.phone ?? "Telefoon"}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, phone: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  inputMode="numeric"
                  value={form.whatsapp}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, whatsapp: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* E-mail & Website */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t.email ?? "E-mailadres"}</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, email: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">{t.website ?? "Website"}</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://..."
                  value={form.website}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, website: e.target.value }))
                  }
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              variant="primaryGrad"
              disabled={saving}
            >
              {saving && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t.createBusinessCta ?? "Bedrijf aanmaken"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}