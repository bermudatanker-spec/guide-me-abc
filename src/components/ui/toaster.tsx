// components/ui/toaster.tsx
"use client";

import { useToast } from "@/hooks/use-toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-md px-4 py-3 shadow-lg text-white
            ${t.variant === "success" ? "bg-green-600" : ""}
            ${t.variant === "destructive" ? "bg-red-600" : ""}
            ${!t.variant || t.variant === "default" ? "bg-gray-800" : ""}
          `}
        >
          {t.title && <div className="font-semibold">{t.title}</div>}
          {t.description && (
            <div className="text-sm opacity-90">{t.description}</div>
          )}

          <button
            onClick={() => dismiss(t.id)}
            className="absolute top-1 right-2 text-xs opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}