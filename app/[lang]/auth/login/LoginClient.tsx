"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import type { Locale } from "@/i18n/config";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { langHref } from "@/lib/lang-href";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Props = {
  lang: Locale;
};

export default function LoginClient({ lang }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
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

      const { error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });

      if (error) throw error;

      toast({
        title: isNl ? "Welkom terug" : "Welcome back",
        description: isNl
          ? "Je bent nu ingelogd."
          : "You are now logged in.",
      });

      router.replace(redirectTo);
    } catch (err: any) {
      toast({
        title: isNl ? "Inloggen mislukt" : "Login failed",
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
            {isNl ? "Inloggen" : "Log in"}
          </CardTitle>
          <CardDescription>
            {isNl
              ? "Log in om reviews te plaatsen en je favoriete plekken te beheren."
              : "Log in to write reviews and manage your favorite places."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                autoComplete="current-password"
                required
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
              {isNl ? "Inloggen" : "Log in"}
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-2">
              {isNl ? "Nog geen account?" : "Don’t have an account yet?"}{" "}
              <button
                type="button"
                className="text-primary font-semibold hover:underline"
                onClick={() =>
                  router.push(
                    `${langHref(lang, "/auth/signup")}?redirect=${encodeURIComponent(redirectTo)}`
                  )
                }
              >
                {isNl ? "Account aanmaken" : "Create account"}
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}