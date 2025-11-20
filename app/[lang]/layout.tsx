// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";

import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";

// Optioneel: basis-URL via env, met fallback
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://guide-me-abc.com";

// ===== Metadata / Viewport =====
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Guide Me ABC",
    template: "%s | Guide Me ABC",
  },
  description:
    "Discover Aruba, Bonaire & Curaçao — businesses, tips and guides.",
  // eventueel alvast canonical:
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  themeColor: "#00BFD3",
};

// ... rest van je RootLayout zoals hij nu al goed was
export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // ...
}
