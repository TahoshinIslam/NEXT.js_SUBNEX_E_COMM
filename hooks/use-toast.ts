"use client";

import { useCallback } from "react";
import { addToast } from "@/components/ui/toaster";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

interface ToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const toast = useCallback((options: ToastOptions) => {
    addToast(options);
  }, []);

  return { toast };
}
