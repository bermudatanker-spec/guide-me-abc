// app/ClientRoot.tsx
"use client";

import { useEffect, type ReactNode } from "react";

import type { Locale } from "@/i18n/config";
import { LanguageProvider } from "@/hooks/useLanguage";
import { AuthProvider } from "@/contexts/AuthContext";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

import { ToastProvider, ToastViewport } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";

import AuthCodeForwarder from "@/components/AuthCodeForwarder";

type Props = {
  lang: Locale;
  children: ReactNode;
};

export default function ClientRoot({ lang, children }: Props) {
  // ✅ Root <html> kan server-side niet dynamisch per locale (zit in app/layout.tsx),
  // dus zetten we het hier client-side correct voor /nl /es /pap.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageProvider initialLang={lang}>
      <AuthProvider>
        <ToastProvider>
          {/* 🔐 Supabase redirect handler (code/#hash -> /auth/callback) */}
          <AuthCodeForwarder />

          {/* Header */}
          <Navigation />

          {/* Page content – [lang]/layout.tsx regelt spacing */}
          {children}

          {/* Footer */}
          <Footer />

          {/* Toasts */}
          <ToastViewport />
          <Toaster />
        </ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}