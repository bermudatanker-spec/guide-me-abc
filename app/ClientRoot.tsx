"use client";

import type { ReactNode } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/hooks/useLanguage";
import type { Locale } from "@/i18n/config";

//...

type ClientRootProps = {
  children: ReactNode;
  lang: string;
};

export default function ClientRoot({ children, lang }: ClientRootProps) {
  return (
    <AuthProvider>
      <LanguageProvider initialLang={lang as Locale}>
        <ToastProvider>
          <Navigation />
          {children}
          <Footer />
          <Toaster />
        </ToastProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}