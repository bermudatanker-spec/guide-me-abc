// app/ClientRoot.tsx
"use client";

import type { ReactNode } from "react";
import { LanguageProvider } from "@/hooks/useLanguage";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import AuthCodeForwarder from "@/components/AuthCodeForwarder"; // 👈 hier!

import type { Locale } from "@/i18n/config";

type Props = {
  lang: Locale;
  children: ReactNode;
};

export default function ClientRoot({ lang, children }: Props) {
  return (
    <LanguageProvider initialLang={lang}>
      <AuthProvider>
        <ToastProvider>
          {/* 🔐 Supabase redirect handler (code/#hash -> /auth/callback) */}
          <AuthCodeForwarder />

          {/* Header */}
          <Navigation />

          {/* Page content – [lang]/layout.tsx zet al pt-16 / spacing */}
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