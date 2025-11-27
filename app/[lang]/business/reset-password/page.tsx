// app/[lang]/business/reset-password/page.tsx
"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useRouter, usePathname } from "next/navigation";

import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { getLangFromPath } from "@/lib/locale-path";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Wachtwoord moet minimaal 8 tekens zijn.")
      .max(100),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Wachtwoorden komen niet overeen.",
    path: ["confirm"],
  });

export default function ResetPasswordPage() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const { lang, t } = useLanguage();
  const { toast } = useToast();
  const supabase = supabaseBrowser();

  const effectiveLang = getLangFromPath(pathname) || lang;

  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  // Check of de user is ingelogd (via magic link / recovery)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;

      if (!data?.user) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            lang === "nl"
              ? "Deze link is ongeldig of verlopen. Probeer opnieuw een reset-link aan te vragen."
              : "This link is invalid or expired. Please request a new reset link.",
        });
        router.replace(`/${effectiveLang}/business/forgot-password`);
        return;
      }

      setChecking(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [supabase, router, effectiveLang, toast, lang]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    let parsed;
    try {
      parsed = schema.parse({ password, confirm });
    } catch (err: any) {
      const msg = err?.issues?.[0]?.message ?? "Validatiefout";
      toast({
        variant: "destructive",
        title: "Error",
        description: msg,
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: parsed.password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
        return;
      }

      toast({
        variant: "success",
        title:
          lang === "nl"
            ? "Wachtwoord bijgewerkt"
            : "Password updated",
        description:
          lang === "nl"
            ? "Je kunt nu inloggen met je nieuwe wachtwoord."
            : "You can now log in with your new password.",
      });

      router.replace(`/${effectiveLang}/business/auth`);
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          {lang === "nl"
            ? "Bezig met controleren van je link…"
            : "Checking your link…"}
        </p>
      </main>
    );
  }

  const title =
    t.reset_title ??
    (lang === "nl" ? "Nieuw wachtwoord instellen" : "Set new password");

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <div className="mx-auto max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {lang === "nl"
              ? "Kies een sterk wachtwoord dat je nog niet eerder gebruikt hebt."
              : "Choose a strong password you have not used before."}
          </p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">
              {lang === "nl" ? "Nieuw wachtwoord" : "New password"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="password">
                  {t.new_pw ?? (lang === "nl" ? "Nieuw wachtwoord" : "New password")}
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm">
                  {t.confirm_pw ??
                    (lang === "nl"
                      ? "Bevestig wachtwoord"
                      : "Confirm password")}
                </Label>
                <Input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                isLoading={loading}
              >
                {t.save_pw ??
                  (lang === "nl" ? "Wachtwoord opslaan" : "Save password")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}