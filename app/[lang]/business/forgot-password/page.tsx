"use client";

import React, { useMemo, useState } from "react";
import { z } from "zod";
import { useRouter, usePathname } from "next/navigation";

import { supabaseBrowser } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { getLangFromPath } from "@/lib/locale-path";

const schema = z.object({
  email: z
    .string()
    .trim()
    .email("Ongeldig e-mailadres")
    .max(255, "E-mailadres is te lang"),
});

/**
 * ✅ Production base URL
 * Zet bij voorkeur in .env:
 * NEXT_PUBLIC_SITE_URL=https://guide-me-abc.com
 */
function getSiteUrl() {
  const env = (process.env.NEXT_PUBLIC_SITE_URL || "").trim();
  const base = env || "https://guide-me-abc.com";
  return base.replace(/\/+$/, ""); // remove trailing slash
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";

  // ✅ single source of truth for lang = URL
  const urlLang = (getLangFromPath(pathname) || "en").toLowerCase();

  const { lang: hookLang, t } = useLanguage();
  const lang = (urlLang || hookLang || "en").toLowerCase();

  const { toast } = useToast();

  const supabase = useMemo(() => supabaseBrowser(), []);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const isNl = lang === "nl";

  const title =
    t.forgot_title ?? (isNl ? "Wachtwoord vergeten" : "Forgot password");
  const subtitle =
    t.forgot_sub ??
    (isNl
      ? "Vul je e-mailadres in. We sturen je een link om je wachtwoord te resetten."
      : "Enter your email. We'll send you a link to reset your password.");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // validate
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      const msg =
        parsed.error.issues?.[0]?.message ??
        (isNl ? "Controleer je e-mailadres." : "Please check your email address.");
      setEmailError(msg);

      toast({
        variant: "destructive",
        title: t.error ?? (isNl ? "Fout" : "Error"),
        description: msg,
      });
      return;
    }

    setEmailError(null);

    try {
      setLoading(true);

      // ✅ Always go to production (or NEXT_PUBLIC_SITE_URL)
      const siteUrl = getSiteUrl();

      // ⬇️ BELANGRIJK: direct naar reset-password op productie domein
      const redirectTo = `${siteUrl}/${lang}/business/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(
        parsed.data.email,
        { redirectTo }
      );

      if (error) {
        toast({
          variant: "destructive",
          title: t.error ?? (isNl ? "Fout" : "Error"),
          description: error.message,
        });
        return;
      }

      toast({
        // @ts-ignore (als jouw toast variants typed zijn)
        variant: "success",
        title: isNl ? "E-mail verzonden" : "Email sent",
        description: isNl
          ? "Check je inbox (en spam) voor de link om je wachtwoord te resetten."
          : "Check your inbox (and spam) for the link to reset your password.",
      });

      // optioneel: terug naar login
      setTimeout(() => {
        router.push(`/${lang}/business/auth`);
      }, 900);
    } finally {
      setLoading(false);
    }
  }

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
              {isNl ? "Reset je wachtwoord" : "Reset your password"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="email">
                  {t.email ?? (isNl ? "E-mailadres" : "Email")}
                </Label>

                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder={isNl ? "jij@example.com" : "you@example.com"}
                  required
                  aria-invalid={Boolean(emailError)}
                />

                {emailError && (
                  <p className="text-xs text-destructive">{emailError}</p>
                )}
              </div>

              <Button type="submit" className="w-full" isLoading={loading}>
                {t.send_reset_link ??
                  (isNl ? "Verstuur reset-link" : "Send reset link")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}