"use client";

import { useEffect, useState, type ReactNode } from "react";

export default function HydrationSafe({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // React Strict Mode runs this twice in dev — that’s OK
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return <>{children}</>;
}