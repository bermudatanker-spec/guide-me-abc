"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import type { Locale } from "@/i18n/config";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { langHref } from "@/lib/lang-href";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";

type Props = {
  lang: Locale;
  listingId: string;
  initialHighlights: string[];
  initialSocials: {
    instagram: string;
    facebook: string;
    tiktok: string;
  };
};

export default function MiniSiteSettingsClient({
  lang,
  listingId,
  initialHighlights,
  initialSocials,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = supabaseBrowser();

  const [h1, setH1] = useState(initialHighlights[0] ?? "");
  const [h2, setH2] = useState(initialHighlights[1] ?? "");
  const [h3, setH3] = useState(initialHighlights[2] ?? "");

  const [instagram, setInstagram] = useState(initialSocials.instagram ?? "");
  const [facebook, setFacebook] = useState(initialSocials.facebook ?? "");
  const [tiktok, setTiktok] = useState(initialSocials.tiktok ?? "");

  const [saving, setSaving] = useState(false);

  const previewHighlights = [h1, h2, h3].filter(Boolean);
  const hasSocials = !!(instagram || facebook || tiktok);

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from("business_listings")
        .update({
          highlight_1: h1 || null,
          highlight_2: h2 || null,
          highlight_3: h3 || null,
          social_instagram: instagram || null,
          social_facebook: facebook || null,
          social_tiktok: tiktok || null,
        })
        .eq("id", listingId);

      if (error) throw error;

      toast({
        title: "Mini-site bijgewerkt",
        description:
          lang === "nl"
            ? "Je wijzigingen zijn opgeslagen."
            : "Your mini-site settings have been saved.",
      });

      router.refresh();
    } catch (err: any) {
      console.error("[mini-site/settings] save error", err);
      toast({
        title:
          lang === "nl"
            ? "Opslaan mislukt"
            : "Could not save mini-site settings",
        description: err?.message ?? "Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  const miniSiteUrl = langHref(lang, `/biz/${listingId}`);

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-8">
      {/* ... rest van je component ongewijzigd ... */}
    </main>
  );
}