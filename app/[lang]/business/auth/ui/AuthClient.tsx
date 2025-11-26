"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  useRouter,
  usePathname,
  useSearchParams,
} from "next/navigation";
import { z } from "zod";
import { Loader2, Eye, EyeOff } from "lucide-react";

import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { langHref } from "@/lib/lang-href";
import { getLangFromPath } from "@/lib/locale-path";
import type { Locale } from "@/i18n/config";
import { useToast } from "@/hooks/use-toast";

// Optioneel: als je business-dicts hebt in i18n/dicts
// import { DICTS } from "@/i18n/dicts";

type Lang = Locale;

/* ------------------------- Validatie schemas ------------------------- */

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Voer je volledige naam in").max(100),
  email: z.string().trim().email("Ongeldig e-mailadres").max(255),
  password: z.string().min(6, "Minimaal 6 tekens").max(100),
});

const signInSchema = z.object({
  email: z.string().trim().email("Ongeldig e-mailadres").max(255),
  password: z.string().min(1, "Wachtwoord is vereist"),
});

type AuthClientProps = {
  lang: Lang;
};

type LoadingState = false | "signin" | "signup";

export default function AuthClient({ lang }: AuthClientProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const search = useSearchParams();
  const { toast } = useToast();

  const supabase = useMemo(() => supabaseBrowser(), []);

  const redirectedFrom = search?.get("redirectedFrom") ?? "";
  const tabFromSearch = search?.get("tab") ?? "";

  const resolvedLang = (getLangFromPath(pathname) || lang) as Lang;

  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState<LoadingState>(false);
  const [tab, setTab] = useState<"signin" | "signup">(
    tabFromSearch === "signup" ? "signup" : "signin"
  );

  const [signInState, setSignInState] = useState({
    email: "",
    password: "",
  });

  const [signUpState, setSignUpState] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [showPwSignIn, setShowPwSignIn] = useState(false);
  const [showPwSignUp, setShowPwSignUp] = useState(false);

  const mountedRef = useRef(false);

  /* ---------------------- Al ingelogd? Direct door ---------------------- */

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

  /* --------------------------- Helper: flash --------------------------- */

  function flashError(message: string) {
    toast({
      title: "Er ging iets mis",
      description: message,
      variant: "destructive",
    });
  }

  function flashOk(message: string) {
    toast({
      title: "Gelukt",
      description: message,
    });
  }

  /* ----------------------------- Handlers ----------------------------- */

  async function handleSignIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const v = signInSchema.parse(signInState);
      setLoading("signin");

      const { error } = await supabase.auth.signInWithPassword({
        email: v.email,
        password: v.password,
      });

      if (error) {
        const msg =
          error.message === "Invalid login credentials"
            ? "Onjuist e-mailadres of wachtwoord."
            : error.message;
        flashError(msg);
        return;
      }

      router.replace(
        redirectedFrom || langHref(resolvedLang, "/business/dashboard")
      );
    } catch (err: any) {
      const zodMsg = err?.issues?.[0]?.message;
      flashError(zodMsg ?? "Controleer je invoer en probeer opnieuw.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const v = signUpSchema.parse(signUpState);
      setLoading("signup");

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
        flashError(error.message || "Kon account niet aanmaken.");
        return;
      }

      flashOk(
        "Account aangemaakt! Check je e-mail om je account te bevestigen."
      );
      setTab("signin");
    } catch (err: any) {
      const zodMsg = err?.issues?.[0]?.message;
      flashError(zodMsg ?? "Controleer je invoer en probeer opnieuw.");
    } finally {
      setLoading(false);
    }
  }

  /* ------------------------------- UI ------------------------------- */

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isSigningIn = loading === "signin";
  const isSigningUp = loading === "signup";

  const isNl = resolvedLang === "nl";

  const title = isNl
    ? "Ondernemers login"
    : "Business login";

  const subtitle = isNl
    ? "Log in of maak een account aan om je bedrijfsvermelding te beheren."
    : "Sign in or create an account to manage your business listing.";

  const signInLabel = isNl ? "Inloggen" : "Sign in";
  const signUpLabel = isNl ? "Account aanmaken" : "Create account";
  const fullNameLabel = isNl ? "Volledige naam" : "Full name";
  const emailLabel = isNl ? "E-mailadres" : "Email";
  const passwordLabel = isNl ? "Wachtwoord" : "Password";

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            {subtitle}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[3fr,2fr] items-start">
          {/* Links: login / signup forms */}
          <Card className="border border-border/70 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <button
                  type="button"
                  onClick={() => setTab("signin")}
                  className={
                    "rounded-full px-3 py-1 text-sm font-medium transition-colors " +
                    (tab === "signin"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted")
                  }
                >
                  {signInLabel}
                </button>
                <button
                  type="button"
                  onClick={() => setTab("signup")}
                  className={
                    "rounded-full px-3 py-1 text-sm font-medium transition-colors " +
                    (tab === "signup"
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-muted")
                  }
                >
                  {signUpLabel}
                </button>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {tab === "signin" ? (
                <form
                  className="space-y-4"
                  onSubmit={handleSignIn}
                  noValidate
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="signin-email">
                      {emailLabel}
                    </Label>
                    <Input
                      id="signin-email"
                      type="email"
                      autoComplete="email"
                      value={signInState.email}
                      onChange={(e) =>
                        setSignInState((s) => ({
                          ...s,
                          email: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="signin-password">
                      {passwordLabel}
                    </Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPwSignIn ? "text" : "password"}
                        autoComplete="current-password"
                        value={signInState.password}
                        onChange={(e) =>
                          setSignInState((s) => ({
                            ...s,
                            password: e.target.value,
                          }))
                        }
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                        onClick={() =>
                          setShowPwSignIn((v) => !v)
                        }
                        aria-label={
                          showPwSignIn
                            ? "Verberg wachtwoord"
                            : "Toon wachtwoord"
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
                    className="w-full"
                    isLoading={isSigningIn}
                  >
                    {signInLabel}
                  </Button>
                </form>
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={handleSignUp}
                  noValidate
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-fullname">
                      {fullNameLabel}
                    </Label>
                    <Input
                      id="signup-fullname"
                      type="text"
                      autoComplete="name"
                      value={signUpState.fullName}
                      onChange={(e) =>
                        setSignUpState((s) => ({
                          ...s,
                          fullName: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email">
                      {emailLabel}
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      autoComplete="email"
                      value={signUpState.email}
                      onChange={(e) =>
                        setSignUpState((s) => ({
                          ...s,
                          email: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="signup-password">
                      {passwordLabel}
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPwSignUp ? "text" : "password"}
                        autoComplete="new-password"
                        value={signUpState.password}
                        onChange={(e) =>
                          setSignUpState((s) => ({
                            ...s,
                            password: e.target.value,
                          }))
                        }
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                        onClick={() =>
                          setShowPwSignUp((v) => !v)
                        }
                        aria-label={
                          showPwSignUp
                            ? "Verberg wachtwoord"
                            : "Toon wachtwoord"
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
                    className="w-full"
                    isLoading={isSigningUp}
                  >
                    {signUpLabel}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Rechts: uitleg / voordelen */}
          <Card className="border border-border/70 bg-muted/40 shadow-card">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">
                {isNl
                  ? "Waarom een zakelijk account?"
                  : "Why a business account?"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                {isNl
                  ? "Beheer je bedrijfsvermelding, voeg foto’s toe, update openingstijden en bereik meer klanten op Aruba, Bonaire en Curaçao."
                  : "Manage your listing, add photos, update opening hours and reach more customers on Aruba, Bonaire and Curaçao."}
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  {isNl
                    ? "Zichtbaar voor toeristen én locals"
                    : "Visible to tourists and locals"}
                </li>
                <li>
                  {isNl
                    ? "Professionele mini-site voor jouw bedrijf"
                    : "Professional mini-site for your business"}
                </li>
                <li>
                  {isNl
                    ? "Eenvoudig beheer, ook vanaf je telefoon"
                    : "Easy to manage, also from your phone"}
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}