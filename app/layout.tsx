// app/layout.tsx
import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "Guide Me ABC",
    template: "%s | Guide Me ABC",
  },
  description:
    "Discover Aruba, Bonaire & Curaçao – guides, tips and business listings.",
};

export const viewport: Viewport = {
  themeColor: "#00bfd3",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
          {children}
      </body>
    </html>
  );
}