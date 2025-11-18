// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";

import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import ClientRoot from "./ClientRoot"; // <— laat dit staan als jouw file zo heet/ligt

// ✅ Fonts met .variable zodat geistSans.variable / geistMono.variable bestaat
const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

// ===== Metadata / Viewport =====
export const metadata: Metadata = {
  title: { default: "Guide Me ABC", template: "%s | Guide Me ABC" },
  description:
    "Discover Aruba, Bonaire & Curaçao — businesses, tips and guides.",
};

export const viewport: Viewport = {
  themeColor: "#00BFD3",
};

// ===== Root Layout =====
export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={[
          geistSans.className, // hoofd-font
          geistMono.variable, // mono als CSS variable
          "min-h-dvh bg-background text-foreground antialiased",
        ].join(" ")}
      >
        {/* Skip link voor a11y */}
        <a
          href="#page-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow"
        >
          Skip to content
        </a>

        {/* Alle client-zaken (providers, navigatie, footer, toaster) in ClientRoot */}
        <ClientRoot>
          <main id="page-content" className="min-h-dvh pt-16">
            {children}
          </main>
        </ClientRoot>
      </body>
    </html>
  );
}