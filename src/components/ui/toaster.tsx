"use client";

import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastTitle,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  if (!toasts || toasts.length === 0) return null;

  return (
    <>
      {toasts.map(({ id, title, description, action, variant }) => (
        <Toast key={id} className={variant === "destructive" ? "destructive" : ""}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
    </>
  );
}