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

function getRolesFromUser(user: any): string[] {
  const raw = user?.app_metadata?.roles;
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((r) => String(r).toLowerCase());
  }
  if (typeof raw === "string") {
    return [raw.toLowerCase()];
  }
  return [];
}

export default function AuthClient({ lang }: { lang: Lang }) {
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
    tabFromSearch === "signup" ? "signup" : "signin"
  );

  const [signInState, setSignInState] = useState({ email: "", password: "" });
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
      title: "Er ging iets mis",
      description: message,
      variant: "destructive",
    });

  const flashOk = (message: string) =>
    toast({
      title: "Gelukt",
      description: message,
    });

  /* ---------------- Al ingelogd? ---------------- */
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (user) {
        const roles = getRolesFromUser(user);
        const isSuperAdmin =
          roles.includes("superadmin") || roles.includes("super_admin");

        const defaultTarget = isSuperAdmin
          ? "/admin"
          : langHref(resolvedLang, "/business/dashboard");

        router.replace(redirectedFrom || defaultTarget);
      } else {
        setAuthLoading(false);
      }
    })();
  }, [redirectedFrom, resolvedLang, router, supabase]);

  /* ---------------- SIGN IN ---------------- */
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
        flashError(
          error.message === "Invalid login credentials"
            ? "Onjuist e-mailadres of wachtwoord."
            : error.message
        );
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        flashError("Kon je account niet ophalen na inloggen.");
        return;
      }

      const roles = getRolesFromUser(user);
      const isSuperAdmin =
        roles.includes("superadmin") || roles.includes("super_admin");

      // Niet-super_admins blokkeren bij pending/afgewezen
      if (!isSuperAdmin) {
        const status =
          (user.user_metadata as any)?.business_status ?? "pending";

        if (status !== "approved") {
          await supabase.auth.signOut();
          flashError(
            resolvedLang === "nl"
              ? "Je aanmelding is ontvangen. We controleren eerst of je bedrijf bestaat. Na goedkeuring ontvang je een e-mail en kun je inloggen."
              : "Your application has been received. We first verify your business. After approval you'll get an email and can log in."
          );
          return;
        }
      }

      const defaultTarget = isSuperAdmin
        ? "/admin"
        : langHref(resolvedLang, "/business/dashboard");

      router.replace(redirectedFrom || defaultTarget);
    } catch (err: any) {
      const zodMsg = err?.issues?.[0]?.message;
      flashError(zodMsg ?? "Controleer je invoer en probeer opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SIGN UP ---------------- */
  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
        flashError(error.message || "Kon account niet aanmaken.");
        return;
      }

      flashOk(
        isNl
          ? "Account aangemaakt! We controleren je bedrijfsgegevens. Na goedkeuring ontvang je een e-mail."
          : "Account created! We will review your business details. After approval you’ll receive an email."
      );
      setTab("signin");
    } catch (err: any) {
      const zodMsg = err?.issues?.[0]?.message;
      flashError(zodMsg ?? "Controleer je invoer en probeer opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
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
          <Card className="overflow-hidden rounded-3xl border border-white/30 bg-white/75 dark:bg-black/60 backdrop-blur-2xl shadow-2xl">
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
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-4">
              {tab === "signin" ? (
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">{emailLabel}</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      className="h-12 bg-white/50 dark:bg-black/40 border-white/20"
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
                        className="h-12 pe-12 bg-white/50 dark:bg-black/40 border-white/20"
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
                      className="h-12 bg-white/50 dark:bg-black/40 border-white/20"
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
                      className="h-12 bg-white/50 dark:bg-black/40 border-white/20"
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
                      className="h-12 bg-white/50 dark:bg-black/40 border-white/20"
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
                        className="h-12 pe-12 bg-white/50 dark:bg-black/40 border-white/20"
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
          </Card>

          {/* RIGHT: Info card */}
          <Card className="rounded-3xl border border-white/30 bg-white/75 dark:bg-black/60 backdrop-blur-2xl shadow-2xl">
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
                  ? "Na het aanmaken van een account kunnen we je bedrijfsgegevens controleren. Je hebt ondertussen gewoon toegang tot het ondernemersdashboard zodra je bent goedgekeurd."
                  : "After creating an account we may review your business details. Once approved you can access the business dashboard."}
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  {isNl
                    ? "Voordeel voor lokale bedrijven: meer zichtbaarheid naast de grote namen"
                    : "Advantage for local companies: more visibility next to big brands"}
                </li>
                <li>
                  {isNl
                    ? "Beheer je bedrijfsgegevens, foto’s en contactinformatie"
                    : "Manage your business details, photos and contact info"}
                </li>
                <li>
                  {isNl
                    ? "Je kunt later altijd extra informatie aanleveren als dat nodig is"
                    : "You can always provide extra information later if needed"}
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}