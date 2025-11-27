"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { getLangFromPath } from "@/lib/locale-path";

export default function AuthPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { lang, t } = useLanguage();
  const { toast } = useToast();

  const effectiveLang = getLangFromPath(pathname ?? "") || lang;

  const supabase = supabaseBrowser();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) {
        toast({
          title: t.error ?? "Fout",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: t.loggedIn ?? "Ingelogd!",
        description: t.redirecting ?? "Je wordt doorgestuurd...",
      });

      router.replace(`/${effectiveLang}/business/dashboard`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold mb-6">
        {t.loginTitle ?? "Inloggen"}
      </h1>

      <form onSubmit={handleLogin} className="space-y-6">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">{t.email ?? "E-mailadres"}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) =>
              setForm((f) => ({ ...f, email: e.target.value }))
            }
          />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <Label htmlFor="password">{t.password ?? "Wachtwoord"}</Label>
          <Input
            id="password"
            type="password"
            required
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
          />

          {/* --- Wachtwoord vergeten link --- */}
          <button
            type="button"
            onClick={() =>
              router.push(`/${effectiveLang}/business/forgot-password`)
            }
            className="text-xs mt-1 text-primary hover:underline text-left"
          >
            {t.forgot ?? "Wachtwoord vergeten?"}
          </button>
        </div>

        <Button type="submit" isLoading={loading} className="w-full">
          {t.login ?? "Inloggen"}
        </Button>
      </form>
    </main>
  );
}