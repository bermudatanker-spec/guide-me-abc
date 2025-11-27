// components/ui/toaster.tsx
"use client";

import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastTitle,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (!toasts.length) return null;

  return (
    <>
      {toasts.map((t) => (
        <Toast
          key={t.id}
          // ✅ variant uit jouw ToastOptions ("default" | "success" | "destructive")
          //    fallback naar "default" voor de zekerheid
          variant={t.variant ?? "default"}
          onOpenChange={(open) => {
            // Als de toast sluit (via swipe, timeout, ESC, etc.) → uit store halen
            if (!open) dismiss(t.id);
          }}
        >
          <div className="grid gap-1">
            {t.title && <ToastTitle>{t.title}</ToastTitle>}
            {t.description && (
              <ToastDescription>{t.description}</ToastDescription>
            )}
          </div>

          {/* Optionele action (bijv. knop) */}
          {t.action}

          {/* Handmatig sluiten via X-knop */}
          <ToastClose onClick={() => dismiss(t.id)} />
        </Toast>
      ))}
    </>
  );
}