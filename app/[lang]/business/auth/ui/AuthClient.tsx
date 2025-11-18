// app/[lang]/business/auth/AuthClient.tsx
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

type Lang = "en" | "nl" | "pap" | "es";

type Translations = Record<string, string>;

interface AuthClientProps {
  lang: Lang;
  t?: Translations | null;
}

export default function AuthClient({ lang, t }: AuthClientProps) {
  const dict = (t ?? {}) as Translations; // ✅ nooit undefined

  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const search = useSearchParams();

  const resolvedLang = (getLangFromPath(pathname) || lang) as Lang;

  const supabase = useMemo(() => supabaseBrowser(), []);
  const redirectedFrom = (search.get("redirectedFrom") || "").trim();

  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState<false | "signin" | "signup">(false);
  const [tab, setTab] = useState<"signin" | "signup">(
    search.get("tab") === "signup" ? "signup" : "signin"
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

  // voorkom dubbele runs in React Strict Mode
  const mountedRef = useRef(false);

  /* ---------------------- Already logged-in short circuit ---------------------- */

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    (async () => {
      const { data, error } = await supabase.auth.getUser();
      console.log("[auth/mount] getUser:", { user: data?.user, error });

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

  /* -------------------------------- Helpers -------------------------------- */

  function flash(type: "ok" | "err", text: string) {
    if (type === "ok") setOkMsg(text);
    else setErrMsg(text);

    setTimeout(() => {
      setOkMsg(null);
      setErrMsg(null);
    }, 3500);
  }

  /* -------------------------------- Actions -------------------------------- */

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();

    try {
      const v = signInSchema.parse(signIn);
      setLoading("signin");

      const { data, error } = await supabase.auth.signInWithPassword({
        email: v.email,
        password: v.password,
      });

      console.log("[signInWithPassword]", { data, error });

      if (error) {
        const msg =
          error.message === "Invalid login credentials"
            ? "Onjuist e-mailadres of wachtwoord"
            : error.message === "Email not confirmed"
            ? "Je e-mailadres is nog niet bevestigd. Check je inbox."
            : `Inloggen mislukt: ${error.message}`;

        flash("err", msg);
        return;
      }

      // extra check totdat sessie echt aanwezig is
      let tries = 0;
      let session = (await supabase.auth.getSession()).data.session;

      while (!session && tries < 5) {
        await new Promise((r) => setTimeout(r, 150));
        session = (await supabase.auth.getSession()).data.session;
        tries++;
      }

      console.log("[post-signin] session:", session);

      if (!session) {
        flash(
          "err",
          "Kon geen sessie starten. Controleer of cookies zijn toegestaan."
        );
        return;
      }

      router.replace(
        redirectedFrom || langHref(resolvedLang, "/business/dashboard")
      );
    } catch (err: any) {
      console.error("[handleSignIn] exception:", err);
      flash("err", err?.issues?.[0]?.message ?? "Validatiefout");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();

    try {
      const v = signUpSchema.parse(signUp);
      setLoading("signup");

      const { data, error } = await supabase.auth.signUp({
        email: v.email,
        password: v.password,
        options: {
          data: { full_name: v.fullName },
          // PKCE email link landt hier
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback`
              : undefined,
        },
      });

      console.log("[signUp]", { data, error });

      if (error) {
        const msg = error.message.toLowerCase().includes("already")
          ? "Account bestaat al. Log in."
          : `Registratie mislukt: ${error.message}`;
        flash("err", msg);
        return;
      }

      if (!data?.session) {
        flash(
          "ok",
          "Account aangemaakt! Check je e-mail om te bevestigen, daarna kun je inloggen."
        );
        setTab("signin");
        return;
      }

      router.replace(
        redirectedFrom || langHref(resolvedLang, "/business/dashboard")
      );
    } catch (err: any) {
      console.error("[handleSignUp] exception:", err);
      flash("err", err?.issues?.[0]?.message ?? "Validatiefout");
    } finally {
      setLoading(false);
    }
  }

  /* ------------------------------ Loading gate ------------------------------ */

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  /* ------------------------------ Translations ------------------------------ */

  const H1 = dict.businessAuthTitle ?? "Business Account";
  const Sub =
    dict.businessAuthSubtitle ?? "Log in or sign up to manage your business";
  const SignIn = dict.signIn ?? "Sign in";
  const SignUp = dict.signUp ?? "Sign up";
  const NameLbl = dict.fullName ?? "Full name";
  const EmailLbl = dict.email ?? "Email";
  const PwLbl = dict.password ?? "Password";
  const Forgot =
    resolvedLang === "nl" ? "Wachtwoord vergeten?" : "Forgot password?";

  /* --------------------------------- Render -------------------------------- */

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">{H1}</h1>
          <p className="text-muted-foreground">{Sub}</p>
        </div>

        {okMsg && (
          <div className="mb-4 rounded-md border border-green-600/30 bg-green-600/10 px-3 py-2 text-sm text-green-700">
            {okMsg}
          </div>
        )}

        {errMsg && (
          <div className="mb-4 rounded-md border border-red-600/30 bg-red-600/10 px-3 py-2 text-sm text-red-700">
            {errMsg}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-3 grid grid-cols-2 rounded-lg border border-border bg-muted p-1">
          <button
            type="button"
            className={`w-full rounded-md px-3 py-2 text-sm ${
              tab === "signin"
                ? "bg-background border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setTab("signin")}
          >
            {SignIn}
          </button>
          <button
            type="button"
            className={`w-full rounded-md px-3 py-2 text-sm ${
              tab === "signup"
                ? "bg-background border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setTab("signup")}
          >
            {SignUp}
          </button>
        </div>

        {tab === "signin" ? (
          <Card>
            <CardHeader>
              <CardTitle>{SignIn}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">{EmailLbl}</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={signIn.email}
                    onChange={(e) =>
                      setSignIn((s) => ({ ...s, email: e.target.value }))
                    }
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">{PwLbl}</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPwSignIn ? "text" : "password"}
                      value={signIn.password}
                      onChange={(e) =>
                        setSignIn((s) => ({
                          ...s,
                          password: e.target.value,
                        }))
                      }
                      required
                      autoComplete="current-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      aria-label={showPwSignIn ? "Hide password" : "Show password"}
                      onClick={() => setShowPwSignIn((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPwSignIn ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  <div className="text-right">
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-primary"
                      onClick={() =>
                        router.push(
                          langHref(resolvedLang, "/business/forgot-password")
                        )
                      }
                    >
                      {Forgot}
                    </button>
                  </div>
                </div>

                <Button
                  className="w-full"
                  type="submit"
                  disabled={loading === "signin"}
                >
                  {loading === "signin" && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {SignIn}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{SignUp}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">{NameLbl}</Label>
                  <Input
                    id="signup-name"
                    value={signUp.fullName}
                    onChange={(e) =>
                      setSignUp((s) => ({ ...s, fullName: e.target.value }))
                    }
                    required
                    autoComplete="name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">{EmailLbl}</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signUp.email}
                    onChange={(e) =>
                      setSignUp((s) => ({ ...s, email: e.target.value }))
                    }
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">{PwLbl}</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPwSignUp ? "text" : "password"}
                      value={signUp.password}
                      onChange={(e) =>
                        setSignUp((s) => ({
                          ...s,
                          password: e.target.value,
                        }))
                      }
                      required
                      autoComplete="new-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      aria-label={showPwSignUp ? "Hide password" : "Show password"}
                      onClick={() => setShowPwSignUp((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPwSignUp ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  className="w-full"
                  type="submit"
                  disabled={loading === "signup"}
                >
                  {loading === "signup" && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {SignUp}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}