// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";

import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";

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

export const metadata: Metadata = {
  title: { default: "Guide Me ABC", template: "%s | Guide Me ABC" },
  description: "Discover Aruba, Bonaire & Curaçao — guides, tips and business listings."
};

export const viewport: Viewport = {
  themeColor: "#00BFD3",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={[
          geistSans.className,
          geistMono.variable,
          "min-h-dvh bg-background text-foreground antialiased"
        ].join(" ")}
      >
        <main id="page-content" className="min-h-dvh pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}