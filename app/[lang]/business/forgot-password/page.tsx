// app/[lang]/business/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { getLangFromPath } from "@/lib/locale-path";
import { usePathname } from "next/navigation";

const schema = z.object({
  email: z
    .string()
    .trim()
    .email("Ongeldig e-mailadres")
    .max(255, "E-mailadres is te lang"),
});

export default function ForgotPasswordPage() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const { lang, t } = useLanguage();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const effectiveLang = getLangFromPath(pathname) || lang;
  const supabase = supabaseBrowser();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    let parsed;
    try {
      parsed = schema.parse({ email });
    } catch (err: any) {
      const msg =
        err?.issues?.[0]?.message ??
        (lang === "nl"
          ? "Controleer je e-mailadres."
          : "Please check your email address.");
      toast({
        variant: "destructive",
        title: "Error",
        description: msg,
      });
      return;
    }

    try {
      setLoading(true);

      // Waar de magic link naartoe moet gaan
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";

      const redirectTo = `${origin}/auth/callback?lang=${effectiveLang}&redirectedFrom=/${effectiveLang}/business/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(
        parsed.email,
        {
          redirectTo,
        }
      );

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
            ? "E-mail verzonden"
            : "Email sent",
        description:
          lang === "nl"
            ? "Check je inbox voor de link om je wachtwoord te resetten."
            : "Check your inbox for the link to reset your password.",
      });

      // optioneel: terug naar login
      setTimeout(() => {
        router.push(`/${effectiveLang}/business/auth`);
      }, 1200);
    } finally {
      setLoading(false);
    }
  }

  const title =
    t.forgot_title ??
    (lang === "nl" ? "Wachtwoord vergeten" : "Forgot password");
  const subtitle =
    t.forgot_sub ??
    (lang === "nl"
      ? "Vul je e-mailadres in. We sturen je een link om je wachtwoord te resetten."
      : "Enter your email. We'll send you a link to reset your password.");

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <div className="mx-auto max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">
              {lang === "nl"
                ? "Reset je wachtwoord"
                : "Reset your password"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="email">
                  {t.email ?? (lang === "nl" ? "E-mailadres" : "Email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    lang === "nl" ? "jij@example.com" : "you@example.com"
                  }
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                isLoading={loading}
              >
                {t.send_reset_link ??
                  (lang === "nl"
                    ? "Verstuur reset-link"
                    : "Send reset link")}
              </Button>

              <button
                type="button"
                onClick={() =>
                  router.push(`/${effectiveLang}/business/auth`)
                }
                className="mt-2 w-full text-xs text-muted-foreground hover:text-primary"
              >
                {t.back ?? (lang === "nl" ? "Terug naar login" : "Back to login")}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
