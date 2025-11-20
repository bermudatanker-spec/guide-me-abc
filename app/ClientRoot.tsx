// app/ClientRoot.tsx
'use client';

import type { ReactNode } from 'react';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ToastProvider } from '@/components/ui/toast';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/hooks/useLanguage';

type ClientRootProps = {
  children: ReactNode;
  lang: string;
};

export default function ClientRoot({ children, lang }: ClientRootProps) {
  // lang gebruiken we later eventueel in LanguageProvider,
  // voor nu is het oké als hij "ongebruikt" is.
  void lang;

  return (
    <AuthProvider>
      <LanguageProvider>
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