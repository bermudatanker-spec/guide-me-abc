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

type T = Record<string, string>;
type Lang = Locale;

type AuthClientProps = {
  lang: Lang;
  t: T;
};

export default function AuthClient({ lang, t }: AuthClientProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const search = useSearchParams();

  const getSearchParam = (key: string): string =>
    search?.get(key)?.trim() ?? "";

  const resolvedLang = (getLangFromPath(pathname) || lang) as Lang;

  const supabase = useMemo(() => supabaseBrowser(), []);

  const redirectedFrom = getSearchParam("redirectedFrom");
  const tabFromSearch = getSearchParam("tab");

  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState<false | "signin" | "signup">(false);
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

  /* ---------------------- Already logged in ---------------------- */

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
  }, []);

  /* ------------------------------ Utils ------------------------------ */

  function flash(type: "ok" | "err", text: string) {
    if (type === "ok") setOkMsg(text);
    else setErrMsg(text);
    setTimeout(() => {
      setOkMsg(null);
      setErrMsg(null);
    }, 3500);
  }

  /* ------------------------------ Actions ------------------------------ */

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();

    try {
      const v = signInSchema.parse(signIn);
      setLoading("signin");

      const { data, error } = await supabase.auth.signInWithPassword({
        email: v.email,
        password: v.password,
      });

      if (error) {
        flash(
          "err",
          error.message === "Invalid login credentials"
            ? "Onjuist e-mailadres of wachtwoord"
            : error.message
        );
        return;
      }

      router.replace(
        redirectedFrom || langHref(resolvedLang, "/business/dashboard")
      );
    } catch (err: any) {
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
        "Account aangemaakt! Check je e-mail om je account te bevestigen."
      );

      setTab("signin");
    } catch (err: any) {
      flash("err", err?.issues?.[0]?.message ?? "Validatiefout");
    } finally {
      setLoading(false);
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

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      {/* je UI zoals eerder */}
    </main>
  );
}