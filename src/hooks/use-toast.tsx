"use client";

import * as React from "react";

/**
 * Welke varianten zijn geldig voor een toast.
 * ✅ Hier staat "success" expliciet bij.
 */
export type ToastVariant = "default" | "success" | "destructive";

export interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: React.ReactNode;
}

export interface ToastOptions extends Omit<ToastItem, "id"> {
  id?: string;
}

// Intern geheugen + listeners (heel simpel store-patroon)
let listeners: React.Dispatch<React.SetStateAction<ToastItem[]>>[] = [];
let store: ToastItem[] = [];

function notify() {
  for (const l of listeners) {
    l([...store]);
  }
}

function addToast(toast: ToastOptions) {
  const id =
    toast.id ??
    (typeof crypto !== "undefined"
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2));

  const item: ToastItem = {
    id,
    title: toast.title,
    description: toast.description,
    variant: toast.variant ?? "default",
    duration: toast.duration ?? 4000,
    action: toast.action,
  };

  store = [item, ...store];
  notify();

  if (item.duration && item.duration > 0) {
    setTimeout(() => {
      store = store.filter((t) => t.id !== id);
      notify();
    }, item.duration);
  }
}

/**
 * Hook om toasts te tonen.
 *
 * Voorbeeld:
 *   const { toast } = useToast();
 *   toast({ variant: "success", title: "Gelukt", description: "..." });
 */
export function useToast() {
  const [toasts, setToasts] = React.useState<ToastItem[]>(store);

  React.useEffect(() => {
    if (!listeners.includes(setToasts)) {
      listeners.push(setToasts);
    }
    return () => {
      listeners = listeners.filter((l) => l !== setToasts);
    };
  }, []);

  const toast = React.useCallback((opts: ToastOptions) => addToast(opts), []);

  const dismiss = React.useCallback((id: string) => {
    store = store.filter((t) => t.id !== id);
    notify();
  }, []);

  return { toast, toasts, dismiss };
}