// app/[lang]/business/reset-password/page.tsx
"use client";

import { useState } from "react";
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
      .min(8, "Wachtwoord moet minimaal 8 tekens zijn."),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    path: ["confirm"],
    message: "Wachtwoorden komen niet overeen.",
  });

export default function ResetPasswordPage() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const { lang, t } = useLanguage();
  const { toast } = useToast();

  const supabase = supabaseBrowser();
  const effectiveLang = getLangFromPath(pathname) || lang;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    let data: { password: string; confirm: string };

    try {
      data = schema.parse({ password, confirm });
    } catch (err: any) {
      const issue = err?.issues?.[0];
      const msg =
        issue?.message ??
        (lang === "nl"
          ? "Controleer je wachtwoordvelden."
          : "Please check your password fields.");

      toast({
        variant: "destructive",
        title: t.error ?? (lang === "nl" ? "Fout" : "Error"),
        description: msg,
      });
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: t.error ?? (lang === "nl" ? "Fout" : "Error"),
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
            : "You can now sign in with your new password.",
      });

      setTimeout(() => {
        router.replace(`/${effectiveLang}/business/auth`);
      }, 1200);
    } finally {
      setLoading(false);
    }
  }

  const title =
    t.reset_title ??
    (lang === "nl" ? "Nieuw wachtwoord instellen" : "Set new password");
  const sub =
    t.forgot_sub ??
    (lang === "nl"
      ? "Kies een nieuw wachtwoord voor je account."
      : "Choose a new password for your account.");

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <div className="mx-auto max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">{sub}</p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">
              {lang === "nl"
                ? "Stel je nieuwe wachtwoord in"
                : "Set your new password"}
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
                    (lang === "nl" ? "Bevestig wachtwoord" : "Confirm password")}
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

              <button
                type="button"
                onClick={() =>
                  router.push(`/${effectiveLang}/business/auth`)
                }
                className="mt-2 w-full text-xs text-muted-foreground hover:text-primary"
              >
                {t.backToDashboard ??
                  (lang === "nl"
                    ? "Terug naar inloggen"
                    : "Back to login")}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}