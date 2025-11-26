// app/[lang]/business/auth/ui/AuthClient.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { z } from "zod";
import { Loader2, Eye, EyeOff } from "lucide-react";

import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { langHref } from "@/lib/lang-href";
import { getLangFromPath } from "@/lib/locale-path";
import type { Locale } from "@/i18n/config";

type Lang = Locale;
type Dict = Record<string, string>;

type AuthClientProps = {
  lang: Lang;
  t: Dict; // vertalingen uit i18n/translations.ts
};

/* ----------------------------- Validation ----------------------------- */

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Voer je volledige naam in").max(100),
  email: z.string().trim().email("Ongeldig e-mailadres").max(255),
  password: z.string().min(6, "Minimaal 6 tekens").max(100),
});

const signInSchema = z.object({
  email: z.string().trim().email("Ongeldig e-mailadres").max(255),
  password: z.string().min(1, "Wachtwoord is vereist"),
});

/* ------------------------- Helper voor teksten ------------------------ */

function tr(t: Dict, key: string, fallback: string): string {
  return t[key] ?? fallback;
}

/* ===================================================================== */
/*                          AUTH CLIENT COMPONENT                        */
/* ===================================================================== */

export default function AuthClient({ lang, t }: AuthClientProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const search = useSearchParams();

  const supabase = useMemo(() => supabaseBrowser(), []);

  const resolvedLang = (getLangFromPath(pathname) || lang) as Lang;
  const redirectedFrom = search?.get("redirectedFrom")?.trim() ?? "";
  const tabFromSearch = search?.get("tab")?.trim() ?? "";

  const [authLoading, setAuthLoading] = useState(true);
  const [mode, setMode] = useState<"idle" | "signin" | "signup">("idle");
  const [tab, setTab] = useState<"signin" | "signup">(
    tabFromSearch === "signup" ? "signup" : "signin"
  );

  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const [signIn, setSignIn] = useState({ email: "", password: "" });
  const [signUp, setSignUp] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [showPwSignIn, setShowPwSignIn] = useState(false);
  const [showPwSignUp, setShowPwSignUp] = useState(false);

  const mountedRef = useRef(false);

  /* ---------------------- Already logged in redirect ---------------------- */

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    (async () => {
      const { data } = await supabase.auth.getUser();

      if (data?.user) {
        router.replace(
          redirectedFrom || langHref(resolvedLang, "/business/dashboard")
        );
      } else {
        setAuthLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------ Helpers ------------------------------ */

  function flash(type: "ok" | "err", text: string) {
    if (type === "ok") setOkMsg(text);
    else setErrMsg(text);

    window.setTimeout(() => {
      setOkMsg(null);
      setErrMsg(null);
    }, 3500);
  }

  const isBusy = mode !== "idle";

  /* ------------------------------ Actions ------------------------------ */

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();

    try {
      const v = signInSchema.parse(signIn);
      setMode("signin");

      const { error } = await supabase.auth.signInWithPassword({
        email: v.email,
        password: v.password,
      });

      if (error) {
        const wrongCreds =
          error.message === "Invalid login credentials" ||
          error.message === "Invalid login credentials." ||
          error.message === "Email not confirmed";

        flash(
          "err",
          wrongCreds
            ? tr(t, "wrongCredentials", "Onjuist e-mailadres of wachtwoord")
            : error.message
        );
        return;
      }

      router.replace(
        redirectedFrom || langHref(resolvedLang, "/business/dashboard")
      );
    } catch (err: any) {
      const msg =
        err?.issues?.[0]?.message ??
        tr(t, "validationError", "Er ging iets mis bij de invoer.");
      flash("err", msg);
    } finally {
      setMode("idle");
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();

    try {
      const v = signUpSchema.parse(signUp);
      setMode("signup");

      const { error } = await supabase.auth.signUp({
        email: v.email,
        password: v.password,
        options: {
          data: { full_name: v.fullName },
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback`
              : undefined,
        },
      });

      if (error) {
        flash("err", error.message);
        return;
      }

      flash(
        "ok",
        tr(
          t,
          "accountCreatedCheckEmail",
          "Account aangemaakt! Check je e-mail om je account te bevestigen."
        )
      );

      setTab("signin");
    } catch (err: any) {
      const msg =
        err?.issues?.[0]?.message ??
        tr(t, "validationError", "Er ging iets mis bij de invoer.");
      flash("err", msg);
    } finally {
      setMode("idle");
    }
  }

  /* ------------------------------ UI ------------------------------ */

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const title = tr(
    t,
    "businessAuthTitle",
    lang === "nl" ? "Ondernemers login" : "Business account"
  );
  const subtitle = tr(
    t,
    "businessAuthSubtitle",
    lang === "nl"
      ? "Log in of maak een account aan om je bedrijfsvermelding te beheren."
      : "Log in or sign up to manage your business listing."
  );

  const signInLabel = tr(t, "signIn", "Inloggen");
  const signUpLabel = tr(t, "signUp", "Account aanmaken");
  const emailLabel = tr(t, "email", "E-mailadres");
  const passwordLabel = tr(t, "password", "Wachtwoord");
  const fullNameLabel = tr(t, "fullName", "Volledige naam");

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <div className="mx-auto max-w-md space-y-6">
        {/* Intro */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        {/* Meldingen */}
        {(okMsg || errMsg) && (
          <div
            className={
              "rounded-md border px-3 py-2 text-sm " +
              (errMsg
                ? "border-red-400 bg-red-50 text-red-700"
                : "border-emerald-400 bg-emerald-50 text-emerald-700")
            }
          >
            {errMsg || okMsg}
          </div>
        )}

        <Card className="border border-border/70 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {tab === "signin" ? signInLabel : signUpLabel}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Tabs */}
            <div className="inline-flex w-full rounded-lg border bg-muted/60 p-1 text-xs sm:text-sm">
              <button
                type="button"
                onClick={() => setTab("signin")}
                className={
                  "flex-1 rounded-md px-3 py-1.5 font-medium transition " +
                  (tab === "signin"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {signInLabel}
              </button>
              <button
                type="button"
                onClick={() => setTab("signup")}
                className={
                  "flex-1 rounded-md px-3 py-1.5 font-medium transition " +
                  (tab === "signup"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {signUpLabel}
              </button>
            </div>

            {/* Sign in form */}
            {tab === "signin" && (
              <form className="space-y-4" onSubmit={handleSignIn}>
                <div className="space-y-1.5">
                  <Label htmlFor="signIn-email">
                  {emailLabel}
                  </Label>
                  <Input
                    id="signIn-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={signIn.email}
                    onChange={(e) =>
                      setSignIn((s) => ({ ...s, email: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signIn-password">
                  {passwordLabel}
                  </Label>
                  <div className="relative">
                    <Input
                      id="signIn-password"
                      type={showPwSignIn ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={signIn.password}
                      onChange={(e) =>
                        setSignIn((s) => ({ ...s, password: e.target.value }))
                      }
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwSignIn((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                      aria-label={
                        showPwSignIn ? "Hide password" : "Show password"
                      }
                    >
                      {showPwSignIn ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isBusy}
                  className="w-full font-semibold"
                >
                  {isBusy && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {signInLabel}
                </Button>
              </form>
            )}

            {/* Sign up form */}
            {tab === "signup" && (
              <form className="space-y-4" onSubmit={handleSignUp}>
                <div className="space-y-1.5">
                  <Label htmlFor="signUp-fullName">
                  {fullNameLabel}
                  </Label>
                  <Input
                    id="signUp-fullName"
                    autoComplete="name"
                    required
                    value={signUp.fullName}
                    onChange={(e) =>
                      setSignUp((s) => ({ ...s, fullName: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signUp-email">
                  {emailLabel}
                  </Label>
                  <Input
                    id="signUp-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={signUp.email}
                    onChange={(e) =>
                      setSignUp((s) => ({ ...s, email: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signUp-password">
                  {passwordLabel}
                  </Label>
                  <div className="relative">
                    <Input
                      id="signUp-password"
                      type={showPwSignUp ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={signUp.password}
                      onChange={(e) =>
                        setSignUp((s) => ({ ...s, password: e.target.value }))
                      }
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwSignUp((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                      aria-label={
                        showPwSignUp ? "Hide password" : "Show password"
                      }
                    >
                      {showPwSignUp ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isBusy}
                  className="w-full font-semibold"
                >
                  {isBusy && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {signUpLabel}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground">
          <button
            type="button"
            onClick={() => router.push(langHref(resolvedLang, "/"))}
            className="underline-offset-2 hover:underline"
          >
            ←{" "}
            {lang === "nl"
              ? "Terug naar de website"
              : "Back to the main site"}
          </button>
        </div>
      </div>
    </main>
  );
}