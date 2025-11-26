// components/ui/toaster.tsx
"use client";

import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastTitle,
  ToastViewport,
  ToastProvider,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (!toasts.length) return null;

  return (
    <ToastProvider>
      {toasts.map((t) => (
        <Toast
          key={t.id}
          variant={t.variant ?? "default"} // ✅ fallback, TS blij
          onOpenChange={(open) => {
            // bij sluiten via swipe/timeout → item uit store halen
            if (!open) dismiss(t.id);
          }}
        >
          <div className="grid gap-1">
            {t.title && <ToastTitle>{t.title}</ToastTitle>}
            {t.description && (
              <ToastDescription>{t.description}</ToastDescription>
            )}
          </div>

          {t.action}

          <ToastClose onClick={() => dismiss(t.id)} />
        </Toast>
      ))}

      <ToastViewport />
    </ToastProvider>
  );
}