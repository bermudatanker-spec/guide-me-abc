"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { z } from "zod";
import { Loader2, Eye, EyeOff } from "lucide-react";

import { supabaseBrowser } from "@/lib/supabase/browser";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { getLangFromPath } from "@/lib/locale-path";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

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
  const effectiveLang = getLangFromPath(pathname) || "en";

  const supabase = useMemo(() => supabaseBrowser(), []);
  const { lang, t } = useLanguage();
  const { toast } = useToast();

  const [checking, setChecking] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [saving, setSaving] = useState(false);

  // 1) Check of de recovery-link een geldige (tijdelijke) sessie heeft gezet
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!alive) return;

        if (data?.user) {
          setHasValidSession(true);
        } else {
          setHasValidSession(false);
        }
      } finally {
        if (alive) setChecking(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = schema.safeParse({ password, confirm });
    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ??
        (lang === "nl"
          ? "Controleer je invoer."
          : "Please check your input.");
      toast({
        variant: "destructive",
        title: t.error ?? (lang === "nl" ? "Fout" : "Error"),
        description: message,
      });
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase.auth.updateUser({
        password: parsed.data.password,
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
        // we hebben vertalingen in DICTS: reset_title / save_pw etc.
        variant: "success",
        title:
          t.reset_title ??
          (lang === "nl" ? "Wachtwoord aangepast" : "Password updated"),
        description:
          t.save_pw ??
          (lang === "nl"
            ? "Je kunt nu inloggen met je nieuwe wachtwoord."
            : "You can now log in with your new password."),
      });

      setTimeout(() => {
        router.replace(`/${effectiveLang}/business/auth`);
      }, 1200);
    } finally {
      setSaving(false);
    }
  }

  // 2) Loading / invalid link states
  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasValidSession) {
    return (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="mx-auto max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">
            {lang === "nl"
              ? "Link ongeldig of verlopen"
              : "Link invalid or expired"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {lang === "nl"
              ? "Vraag een nieuwe wachtwoord-reset aan en probeer het opnieuw."
              : "Request a new password reset link and try again."}
          </p>
          <Button
            variant="hero"
            onClick={() =>
              router.replace(`/${effectiveLang}/business/forgot-password`)
            }
          >
            {lang === "nl"
              ? "Nieuwe reset-link aanvragen"
              : "Request new reset link"}
          </Button>
        </div>
      </main>
    );
  }

  // 3) Normale reset–UI
  const title =
    t.reset_title ??
    (lang === "nl" ? "Nieuw wachtwoord instellen" : "Set new password");
  const subtitle =
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
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">
              {lang === "nl"
                ? "Stel je nieuwe wachtwoord in"
                : "Set your new password"}
            </CardTitle>
            <CardDescription>
              {lang === "nl"
                ? "Gebruik minimaal 8 tekens. Combineer hoofdletters, cijfers en symbolen voor extra veiligheid."
                : "Use at least 8 characters. Combine upper-case, numbers and symbols for extra security."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* New password */}
              <div className="space-y-1.5">
                <Label htmlFor="password">
                  {t.new_pw ?? (lang === "nl" ? "Nieuw wachtwoord" : "New password")}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={t.show_pw ?? "Show password"}
                  >
                    {showPw ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirm">
                  {t.confirm_pw ??
                    (lang === "nl" ? "Bevestig wachtwoord" : "Confirm password")}
                </Label>
                <div className="relative">
                  <Input
                    id="confirm"
                    type={showConfirmPw ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPw((v) => !v)}
                    aria-label={t.show_pw ?? "Show password"}
                  >
                    {showConfirmPw ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                isLoading={saving}
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
                    ? "Terug naar login"
                    : "Back to login")}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}