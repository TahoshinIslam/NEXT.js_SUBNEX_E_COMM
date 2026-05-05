"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Toast } from "@/hooks/use-toast";

// Simple standalone toaster that doesn't need shadcn
let toastCount = 0;
const listeners: Array<(toasts: Toast[]) => void> = [];
let globalToasts: Toast[] = [];

export function addToast(toast: Omit<Toast, "id">) {
  const id = String(++toastCount);
  const newToast = { ...toast, id };
  globalToasts = [...globalToasts, newToast];
  listeners.forEach((l) => l(globalToasts));

  setTimeout(() => {
    globalToasts = globalToasts.filter((t) => t.id !== id);
    listeners.forEach((l) => l(globalToasts));
  }, 4000);
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (t: Toast[]) => setToasts([...t]);
    listeners.push(listener);
    return () => {
      const idx = listeners.indexOf(listener);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  function dismiss(id: string) {
    globalToasts = globalToasts.filter((t) => t.id !== id);
    listeners.forEach((l) => l(globalToasts));
  }

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-2xl backdrop-blur-sm animate-in slide-in-from-right-5",
            toast.variant === "destructive"
              ? "bg-destructive/15 border-destructive/25 text-red-400"
              : "bg-card/95 border-border text-foreground"
          )}
        >
          {toast.variant === "destructive" ? (
            <XCircle className="w-4 h-4 mt-0.5 shrink-0 text-destructive" />
          ) : (
            <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{toast.title}</p>
            {toast.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
