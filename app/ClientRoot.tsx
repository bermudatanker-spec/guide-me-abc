// app/ClientRoot.tsx
"use client";

import type { ReactNode } from "react";
import { LanguageProvider } from "@/hooks/useLanguage";
import { AuthProvider } from "@/contexts/AuthContext"; // pad evt. aanpassen
import Navigation from "@/components/Navigation"; // jouw header
import Footer from "@/components/Footer"; // of "@/components/Footer"
import { ToastProvider, ToastViewport } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
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
          {/* Header */}
          <Navigation />

          {/* Page content – [lang]/layout.tsx geeft al pt-16 */}
          {children}

          {/* Footer altijd onderaan */}
          <Footer />

          {/* Toasts */}
          <ToastViewport />
          <Toaster />
        </ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}