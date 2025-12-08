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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { langHref } from "@/lib/lang-href";
import { getLangFromPath } from "@/lib/locale-path";
import type { Locale } from "@/i18n/config";
import { useToast } from "@/hooks/use-toast";

type Lang = Locale;

type AuthClientProps = {
  lang: Lang;
  allowRegistrations: boolean;
  forceEmailVerification: boolean;
};

/* ---------- Validatie ---------- */

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Voer je volledige naam in").max(100),
  companyName: z.string().trim().min(2, "Voer je bedrijfsnaam in").max(150),
  email: z.string().trim().email("Ongeldig e-mailadres").max(255),
  password: z.string().min(6, "Minimaal 6 tekens").max(100),
});

const signInSchema = z.object({
  email: z.string().trim().email("Ongeldig e-mailadres").max(255),
  password: z.string().min(1, "Wachtwoord is vereist"),
});

type LoadingState = false | "signin" | "signup";

/* ---------- Helpers ---------- */

function getRolesFromUser(user: any): string[] {
  const raw = user?.app_metadata?.roles;
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((r) => String(r).toLowerCase());
  if (typeof raw === "string") return [raw.toLowerCase()];
  return [];
}

function getRedirectForRoles(lang: Lang, roles: string[]): string {
  const lower = roles.map((r) => r.toLowerCase());
  const hasSuperAdmin =
    lower.includes("super_admin") || lower.includes("superadmin");
  const hasAdmin = lower.includes("admin") || lower.includes("moderator");

  if (hasSuperAdmin) return `/${lang}/godmode`; // God Mode
  if (hasAdmin) return `/${lang}/admin/businesses`; // future admin-dashboard
  return langHref(lang, "/business/dashboard");
}

/* ================== Component ================== */

export default function AuthClient({
  lang,
  allowRegistrations,
  forceEmailVerification,
}: AuthClientProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const search = useSearchParams();
  const { toast } = useToast();

  const supabase = useMemo(() => supabaseBrowser(), []);

  const redirectedFrom = search?.get("redirectedFrom") ?? "";
  const tabFromSearch = search?.get("tab") ?? "";

  const resolvedLang = (getLangFromPath(pathname) || lang) as Lang;
  const isNl = resolvedLang === "nl";

  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState<LoadingState>(false);
  const [tab, setTab] = useState<"signin" | "signup">(
    !allowRegistrations
      ? "signin"
      : tabFromSearch === "signup"
      ? "signup"
      : "signin",
  );

  const [signInState, setSignInState] = useState({
    email: "",
    password: "",
  });
  const [signUpState, setSignUpState] = useState({
    fullName: "",
    companyName: "",
    email: "",
    password: "",
  });

  const [showPwSignIn, setShowPwSignIn] = useState(false);
  const [showPwSignUp, setShowPwSignUp] = useState(false);

  const mountedRef = useRef(false);

  const flashError = (message: string) =>
    toast({
      title: isNl ? "Er ging iets mis" : "Something went wrong",
      description: message,
      variant: "destructive",
    });

  const flashOk = (message: string) =>
    toast({
      title: isNl ? "Gelukt" : "Done",
      description: message,
    });

  /* ---------- 1. Al ingelogd? ---------- */

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) {
        setAuthLoading(false);
        return;
      }

      const roles = getRolesFromUser(user);
      const target = redirectedFrom || getRedirectForRoles(resolvedLang, roles);

      router.replace(target);
    })();
  }, [redirectedFrom, resolvedLang, router, supabase]);

  /* ---------- 2. SIGN IN ---------- */

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const v = signInSchema.parse(signInState);
      setLoading("signin");

      const { error } = await supabase.auth.signInWithPassword({
        email: v.email,
        password: v.password,
      });

      if (error) {
        const msg = error.message?.toLowerCase() ?? "";

        if (
          forceEmailVerification &&
          (msg.includes("email not confirmed") ||
            msg.includes("email_not_confirmed") ||
            msg.includes("email address is not confirmed"))
        ) {
          flashError(
            isNl
              ? "Je e-mailadres is nog niet bevestigd. Check je inbox (en spam) voor de bevestigingsmail."
              : "Your email address is not confirmed yet. Please check your inbox (and spam) for the confirmation email.",
          );
        } else {
          flashError(
            error.message === "Invalid login credentials"
              ? isNl
                ? "Onjuist e-mailadres of wachtwoord."
                : "Invalid email or password."
              : error.message,
          );
        }

        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        flashError(
          isNl
            ? "Kon je account niet ophalen na inloggen."
            : "Could not load your account after sign-in.",
        );
        return;
      }

      const roles = getRolesFromUser(user);
      const target = redirectedFrom || getRedirectForRoles(resolvedLang, roles);

      router.replace(target);
    } catch (err: any) {
      const zodMsg = err?.issues?.[0]?.message;
      flashError(
        zodMsg ??
          (isNl
            ? "Controleer je invoer en probeer opnieuw."
            : "Please check your input and try again."),
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------- 3. SIGN UP ---------- */

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!allowRegistrations) {
      flashError(
        isNl
          ? "Nieuwe registraties zijn tijdelijk uitgeschakeld."
          : "New registrations are temporarily disabled.",
      );
      return;
    }

    try {
      const v = signUpSchema.parse(signUpState);
      setLoading("signup");

      const { error } = await supabase.auth.signUp({
        email: v.email,
        password: v.password,
        options: {
          data: {
            full_name: v.fullName,
            business_name: v.companyName,
            business_status: "pending",
          },
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback`
              : undefined,
        },
      });

      if (error) {
        flashError(
          error.message ||
            (isNl
              ? "Kon account niet aanmaken."
              : "Could not create your account."),
        );
        return;
      }

      flashOk(
        isNl
          ? "Account aangemaakt! Je kunt inloggen zodra je je e-mail hebt bevestigd."
          : "Account created! You can sign in once you’ve confirmed your email.",
      );
      setTab("signin");
    } catch (err: any) {
      const zodMsg = err?.issues?.[0]?.message;
      flashError(
        zodMsg ??
          (isNl
            ? "Controleer je invoer en probeer opnieuw."
            : "Please check your input and try again."),
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------- 4. UI ---------- */

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isSigningIn = loading === "signin";
  const isSigningUp = loading === "signup";

  const title = isNl ? "Ondernemers login" : "Business login";
  const subtitle = isNl
    ? "Log in of maak een account aan om je bedrijfsvermelding te beheren."
    : "Sign in or create an account to manage your business listing.";

  const signInLabel = isNl ? "Inloggen" : "Sign in";
  const signUpLabel = isNl ? "Account aanmaken" : "Create account";
  const fullNameLabel = isNl ? "Volledige naam" : "Full name";
  const companyLabel = isNl ? "Bedrijfsnaam" : "Business name";
  const emailLabel = isNl ? "E-mailadres" : "Email";
  const passwordLabel = isNl ? "Wachtwoord" : "Password";

  const signUpDisabledText = isNl
    ? "Nieuwe registraties zijn momenteel uitgeschakeld."
    : "New registrations are currently disabled.";

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
          {/* LEFT: Auth card */}
          <Card className="gm-glass p-6">
            <div className="gm-glass-inner">
              <CardHeader className="pb-4">
                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTab("signin")}
                    className={`px-6 py-3 rounded-2xl text-sm font-medium transition-all ${
                      tab === "signin"
                        ? "bg-white/90 dark:bg-white/20 shadow-md"
                        : "bg-transparent hover:bg-white/30 dark:hover:bg-white/10"
                    }`}
                  >
                    {signInLabel}
                  </button>

                  {allowRegistrations && (
                    <button
                      type="button"
                      onClick={() => setTab("signup")}
                      className={`px-6 py-3 rounded-2xl text-sm font-medium transition-all ${
                        tab === "signup"
                          ? "bg-white/90 dark:bg-white/20 shadow-md"
                          : "bg-transparent hover:bg-white/30 dark:hover:bg-white/10"
                      }`}
                    >
                      {signUpLabel}
                    </button>
                  )}
                </div>
                {!allowRegistrations && (
                  <p className="mt-3 text-center text-xs text-amber-600 dark:text-amber-400">
                    {signUpDisabledText}
                  </p>
                )}
              </CardHeader>

              <CardContent className="space-y-6 pt-4">
                {tab === "signin" || !allowRegistrations ? (
                  <form onSubmit={handleSignIn} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">{emailLabel}</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        autoComplete="email"
                        className="h-12 gm-glass-input"
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
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">{passwordLabel}</Label>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          type={showPwSignIn ? "text" : "password"}
                          autoComplete="current-password"
                          className="h-12 pe-12 gm-glass-input"
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
                          onClick={() => setShowPwSignIn((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showPwSignIn ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12"
                      isLoading={isSigningIn}
                    >
                      {signInLabel}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleSignUp} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="signup-fullname">{fullNameLabel}</Label>
                      <Input
                        id="signup-fullname"
                        type="text"
                        autoComplete="name"
                        className="h-12 gm-glass-input"
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
                    <div className="space-y-2">
                      <Label htmlFor="signup-company">{companyLabel}</Label>
                      <Input
                        id="signup-company"
                        type="text"
                        className="h-12 gm-glass-input"
                        value={signUpState.companyName}
                        onChange={(e) =>
                          setSignUpState((s) => ({
                            ...s,
                            companyName: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">{emailLabel}</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        autoComplete="email"
                        className="h-12 gm-glass-input"
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
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">{passwordLabel}</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPwSignUp ? "text" : "password"}
                          autoComplete="new-password"
                          className="h-12 pe-12 gm-glass-input"
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
                          onClick={() => setShowPwSignUp((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
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
                      type="submit"
                      className="w-full h-12"
                      isLoading={isSigningUp}
                    >
                      {signUpLabel}
                    </Button>
                  </form>
                )}
              </CardContent>
            </div>
          </Card>

          {/* RIGHT: Info card */}
          <Card className="gm-glass p-6">
            <div className="gm-glass-inner">
              <CardHeader>
                <h2 className="text-base sm:text-lg font-semibold">
                  {isNl
                    ? "Wat gebeurt er met je aanmelding?"
                    : "What happens with your application?"}
                </h2>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  {isNl
                    ? "Na het aanmaken van een account kun je meteen inloggen. Je bedrijf wordt pas zichtbaar voor toeristen als het is goedgekeurd."
                    : "After creating an account you can sign in immediately. Your business only becomes visible to tourists after approval."}
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    {isNl
                      ? "Meer zichtbaarheid voor lokale bedrijven naast de grote namen."
                      : "More visibility for local companies next to big brands."}
                  </li>
                  <li>
                    {isNl
                      ? "Beheer je bedrijfsgegevens, foto’s en contactinformatie."
                      : "Manage your business details, photos and contact info."}
                  </li>
                  <li>
                    {isNl
                      ? "Je kunt altijd later extra informatie toevoegen."
                      : "You can always add extra information later if needed."}
                  </li>
                </ul>
              </CardContent>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}