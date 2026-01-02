// src/app/ClientRoot.tsx
"use client";

import { useEffect, type ReactNode } from "react";

import type { Locale } from "@/i18n/config";
import { LanguageProvider } from "@/hooks/useLanguage";
import { AuthProvider } from "@/contexts/AuthContext";

import Footer from "@/components/Footer";

import { ToastProvider, ToastViewport } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";

import AuthCodeForwarder from "@/components/AuthCodeForwarder";

type Props = {
  lang: Locale;
  children: ReactNode;
};

export default function ClientRoot({ lang, children }: Props) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageProvider initialLang={lang}>
      <AuthProvider>
        <ToastProvider>
          <AuthCodeForwarder />

          {/* ✅ Navigation is SERVER-side in [lang]/layout.tsx */}

          {children}

          <Footer />

          <ToastViewport />
          <Toaster />
        </ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}