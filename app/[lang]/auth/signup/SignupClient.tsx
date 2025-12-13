"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import type { Locale } from "@/i18n/config";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useToast } from "@/hooks/use-toast";
import { langHref } from "@/lib/lang-href";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Props = {
  lang: Locale;
};

export default function SignupClient({ lang }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const redirectTo = searchParams?.get("redirect") || `/${lang}`;

  const isNl = lang === "nl";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast({
        title: isNl ? "Controleer je invoer" : "Check your input",
        description: isNl
          ? "E-mail en wachtwoord zijn verplicht."
          : "Email and password are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
      });

      if (error) throw error;

      const user = data.user;

      if (user) {
        // maak profielrecord aan
        const { error: profileError } = await supabase.from("profiles").insert({
          id: user.id,
          full_name: form.full_name || null,
          role: "user",
        });

        if (profileError) {
          console.warn("[signup] profile insert error", profileError);
        }
      }

      toast({
        title: isNl ? "Account aangemaakt" : "Account created",
        description: isNl
          ? "Controleer je e-mail om je account te bevestigen (indien vereist)."
          : "Check your email to confirm your account (if required).",
      });

      router.replace(redirectTo);
    } catch (err: any) {
      toast({
        title: isNl ? "Fout bij registreren" : "Signup error",
        description: err?.message ?? (isNl ? "Er ging iets mis." : "Something went wrong."),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fdf7f1] flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-bold">
            {isNl ? "Account aanmaken" : "Create an account"}
          </CardTitle>
          <CardDescription>
            {isNl
              ? "Maak een gratis account om reviews te plaatsen en favoriete plekken op te slaan."
              : "Create a free account to write reviews and save your favorite places."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Naam */}
            <div className="space-y-1.5">
              <Label htmlFor="full_name">{isNl ? "Naam (optioneel)" : "Name (optional)"}</Label>
              <Input
                id="full_name"
                autoComplete="name"
                value={form.full_name}
                onChange={(e) => setForm((s) => ({ ...s, full_name: e.target.value }))}
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              />
            </div>

            {/* Wachtwoord */}
            <div className="space-y-1.5">
              <Label htmlFor="password">{isNl ? "Wachtwoord" : "Password"}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              />
            </div>

            <Button
              type="submit"
              className="w-full text-white font-semibold shadow-glow"
              disabled={saving}
              style={{
                background: "linear-gradient(90deg, #00BFD3 0%, #00E0A1 100%)",
              }}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isNl ? "Account aanmaken" : "Create account"}
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-2">
              {isNl ? "Heb je al een account?" : "Already have an account?"}{" "}
              <button
                type="button"
                className="text-primary font-semibold hover:underline"
                onClick={() =>
                  router.push(
                    `${langHref(lang, "/auth/login")}?redirect=${encodeURIComponent(redirectTo)}`
                  )
                }
              >
                {isNl ? "Log in" : "Log in"}
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}