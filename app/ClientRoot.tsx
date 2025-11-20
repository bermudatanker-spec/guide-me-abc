"use client";

import type { ReactNode } from "react";
import HydrationSafe from "@/components/HydrationSafe";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/components/ui/toast";   // ✅ toevoegen
import { Toaster } from "@/components/ui/toaster";        // blijft
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/hooks/useLanguage";

export default function ClientRoot({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ToastProvider>   {/* ✅ FIX - ToastProvider toegevoegd */}
          <HydrationSafe>
            <Navigation />

            {children}

            <Footer />

            <Toaster />   {/* moet BINNEN ToastProvider */}
          </HydrationSafe>
        </ToastProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}