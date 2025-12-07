// src/app/[lang]/account/AccountClient.tsx
"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { Locale } from "@/i18n/config";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  lang: Locale;
};

const COPY: Record<
  Locale,
  {
    title: string;
    subtitle: string;
    nameLabel: string;
    emailLabel: string;
    saveBtn: string;
    savingBtn: string;
    logoutBtn: string;
    savingSuccess: string;
    savingError: string;
    loadError: string;
  }
> = {
  en: {
    title: "Your account",
    subtitle:
      "Manage your profile and sign out of your Guide Me ABC account.",
    nameLabel: "Full name",
    emailLabel: "Email address",
    saveBtn: "Save changes",
    savingBtn: "Saving...",
    logoutBtn: "Log out",
    savingSuccess: "Profile updated",
    savingError: "Could not update your profile. Please try again.",
    loadError: "Could not load your account. Please log in again.",
  },
  nl: {
    title: "Je account",
    subtitle:
      "Beheer je profiel en meld je af bij je Guide Me ABC-account.",
    nameLabel: "Volledige naam",
    emailLabel: "E-mailadres",
    saveBtn: "Wijzigingen opslaan",
    savingBtn: "Bezig met opslaan...",
    logoutBtn: "Uitloggen",
    savingSuccess: "Profiel bijgewerkt",
    savingError: "Profiel bijwerken is mislukt. Probeer het opnieuw.",
    loadError: "Account kon niet geladen worden. Log opnieuw in.",
  },
  pap: {
    title: "Bo kuenta",
    subtitle:
      "Manehá bo perfil i sali for di bo kuenta di Guide Me ABC.",
    nameLabel: "Nòmber kompletu",
    emailLabel: "Email-adres",
    saveBtn: "Warda kambionan",
    savingBtn: "Ta warda...",
    logoutBtn: "Sali",
    savingSuccess: "Perfil a wordu aktualisá",
    savingError: "No por a aktualisá bo perfil. Purba di nobo.",
    loadError: "No por a karga bo kuenta. Por fabor log in atrobe.",
  },
  es: {
    title: "Tu cuenta",
    subtitle:
      "Gestiona tu perfil y cierra la sesión de tu cuenta de Guide Me ABC.",
    nameLabel: "Nombre completo",
    emailLabel: "Correo electrónico",
    saveBtn: "Guardar cambios",
    savingBtn: "Guardando...",
    logoutBtn: "Cerrar sesión",
    savingSuccess: "Perfil actualizado",
    savingError: "No se pudo actualizar el perfil. Inténtalo de nuevo.",
    loadError: "No se pudo cargar la cuenta. Inicia sesión de nuevo.",
  },
} as const;

export default function AccountClient({ lang }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const t = COPY[lang] ?? COPY.en;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  // Account laden
  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();

      if (cancelled) return;

      if (error || !data.user) {
        toast({
          title: t.loadError,
          variant: "destructive",
        });
        // naar login met redirect terug naar account
router.replace(`/${lang}/business/auth?redirectedFrom=/${lang}/account`);
        return;
      }

      const user = data.user;

      setEmail(user.email ?? "");
      setFullName(
        (user.user_metadata?.full_name as string | undefined) ?? ""
      );
      setLoading(false);
    }

    void loadUser();

    return () => {
      cancelled = true;
    };
    // t verandert alleen als lang verandert, dus lang is genoeg
  }, [lang, router, supabase, toast, t.loadError]);

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    });

    setSaving(false);

    if (error) {
      toast({
        title: t.savingError,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: t.savingSuccess,
    });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push(`/${lang}`);
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl shadow-card">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            {t.title}
          </CardTitle>
          <CardDescription>{t.subtitle}</CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-10 w-full rounded bg-muted" />
              <div className="h-4 w-28 rounded bg-muted mt-6" />
              <div className="h-10 w-full rounded bg-muted" />
              <div className="h-10 w-40 rounded bg-muted mt-6" />
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">{t.nameLabel}</Label>
                <Input
                  id="full_name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t.emailLabel}</Label>
                <Input
                  id="email"
                  value={email}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLogout}
                >
                  {t.logoutBtn}
                </Button>

                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-ocean-btn btn-glow text-white px-6"
                >
                  {saving ? t.savingBtn : t.saveBtn}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}