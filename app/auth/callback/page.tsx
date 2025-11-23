"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const supabase = supabaseBrowser();

    const code = search?.get("code") ?? search?.get("token") ?? "";
    const lang = search?.get("lang") ?? "en";
    const redirectedFrom = search?.get("redirectedFrom") ?? "";

    if (!code) {
      setMsg("Missing code in URL.");
      return;
    }

    (async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        setMsg(error.message);
        return;
      }

      router.replace(
        redirectedFrom || `/${lang}/business/reset-password`
      );
    })();
  }, [router, search]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-muted-foreground">
        {msg ?? "Bevestigen van je sessie…"}
      </p>
    </main>
  );
}
