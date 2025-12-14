// app/layout.tsx
import "./globals.css";

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://guide-me-abc.com"),
  title: {
    default: "Guide Me ABC",
    template: "%s | Guide Me ABC",
  },
  description:
    "Discover Aruba, Bonaire & Curaçao – guides, tips and business listings.",
  applicationName: "Guide Me ABC",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#00bfd3",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      // Root layout kan de locale niet kennen (die zit in app/[lang]).
      // We zetten een veilige default; echte locale kan je client-side zetten in ClientRoot.
      lang="en"
      className={inter.variable}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-background text-foreground antialiased font-sans">
        {children}
      </body>
    </html>
  );
}