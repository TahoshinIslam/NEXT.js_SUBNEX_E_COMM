import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isPast, differenceInDays } from "date-fns";
import { type Decimal } from "@prisma/client/runtime/library";
import type { SubscriptionStatus } from "@prisma/client";
import { Bot, PlaySquare, Scissors, Zap, Cloud, Package, Music, ShieldCheck, Gamepad2 } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─────────────────────────────────────────
// Date helpers
// ─────────────────────────────────────────

export function formatDate(date: Date | string): string {
  return format(new Date(date), "dd MMM yyyy");
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "dd MMM yyyy, hh:mm a");
}

export function formatRelative(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function daysUntilExpiry(expiryDate: Date | string): number {
  return differenceInDays(new Date(expiryDate), new Date());
}

export function isExpired(expiryDate: Date | string): boolean {
  return isPast(new Date(expiryDate));
}

export function calculateExpiryDate(purchaseDate: Date | string, durationDays: number): Date {
  const date = new Date(purchaseDate);
  date.setDate(date.getDate() + durationDays);
  return date;
}

// ─────────────────────────────────────────
// Currency helpers
// ─────────────────────────────────────────

export function formatCurrency(amount: number | string | Decimal, currency = "BDT"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : Number(amount);
  if (currency === "BDT") {
    return `৳${num.toLocaleString("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(num);
}

export function formatUSD(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `$${num.toFixed(2)}`;
}

// ─────────────────────────────────────────
// Status helpers
// ─────────────────────────────────────────

export function getStatusColor(status: SubscriptionStatus): string {
  switch (status) {
    case "ACTIVE":
      return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    case "EXPIRING_SOON":
      return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    case "EXPIRED":
      return "text-red-400 bg-red-400/10 border-red-400/20";
    case "CANCELLED":
      return "text-slate-400 bg-slate-400/10 border-slate-400/20";
    default:
      return "text-slate-400 bg-slate-400/10 border-slate-400/20";
  }
}

export function getStatusLabel(status: SubscriptionStatus): string {
  switch (status) {
    case "ACTIVE": return "Active";
    case "EXPIRING_SOON": return "Expiring Soon";
    case "EXPIRED": return "Expired";
    case "CANCELLED": return "Cancelled";
    default: return status;
  }
}

export function computeSubscriptionStatus(expiryDate: Date | string): SubscriptionStatus {
  const days = daysUntilExpiry(expiryDate);
  if (days < 0) return "EXPIRED";
  if (days <= 3) return "EXPIRING_SOON";
  return "ACTIVE";
}

// ─────────────────────────────────────────
// Category helpers
// ─────────────────────────────────────────

export function getCategoryEmoji(category: string): string {
  switch (category) {
    case "AI": return "🤖";
    case "STREAMING": return "🎬";
    case "EDITING": return "✂️";
    case "PRODUCTIVITY": return "⚡";
    case "CLOUD": return "☁️";
    case "MUSIC": return "🎵";
    case "SECURITY": return "🛡️";
    case "GAMING": return "🎮";
    default: return "📦";
  }
}

export function getCategoryIcon(category: string) {
  switch (category) {
    case "AI": return Bot;
    case "STREAMING": return PlaySquare;
    case "EDITING": return Scissors;
    case "PRODUCTIVITY": return Zap;
    case "CLOUD": return Cloud;
    case "MUSIC": return Music;
    case "SECURITY": return ShieldCheck;
    case "GAMING": return Gamepad2;
    default: return Package;
  }
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case "AI": return "text-violet-400 bg-violet-400/10";
    case "STREAMING": return "text-rose-400 bg-rose-400/10";
    case "EDITING": return "text-blue-400 bg-blue-400/10";
    case "PRODUCTIVITY": return "text-amber-400 bg-amber-400/10";
    case "CLOUD": return "text-cyan-400 bg-cyan-400/10";
    default: return "text-slate-400 bg-slate-400/10";
  }
}

// ─────────────────────────────────────────
// Payment helpers
// ─────────────────────────────────────────

export function getPaymentStatusColor(status: string): string {
  switch (status) {
    case "PAID": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    case "DUE": return "text-red-400 bg-red-400/10 border-red-400/20";
    case "PARTIAL": return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    case "REFUNDED": return "text-slate-400 bg-slate-400/10 border-slate-400/20";
    default: return "text-slate-400 bg-slate-400/10 border-slate-400/20";
  }
}

export function getPaymentMethodLabel(method: string | null): string {
  if (!method) return "—";
  const map: Record<string, string> = {
    CASH: "Cash",
    BKASH: "bKash",
    NAGAD: "Nagad",
    ROCKET: "Rocket",
    BANK_TRANSFER: "Bank Transfer",
    CARD: "Card",
    OTHER: "Other",
  };
  return map[method] ?? method;
}

// ─────────────────────────────────────────
// Misc
// ─────────────────────────────────────────

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
