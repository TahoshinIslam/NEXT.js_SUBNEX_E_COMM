"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ShoppingCart, User, BarChart3, Menu, X } from "lucide-react";
import { useCart } from "./CartProvider";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Browse", href: "/store" },
  { label: "AI Tools", href: "/store?category=AI" },
  { label: "Streaming", href: "/store?category=STREAMING" },
  { label: "Editing", href: "/store?category=EDITING" },
];

export function StoreHeader() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const currentHref = category ? `${pathname}?category=${category}` : pathname;

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#080c10]/90 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
        <Link href="/store" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/20 border border-[#3b82f6]/30 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-[#3b82f6]" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">SubTrack</span>
          <span className="hidden sm:inline text-xs font-medium px-1.5 py-0.5 rounded-md bg-[#3b82f6]/15 text-[#3b82f6] border border-[#3b82f6]/20">
            Store
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = currentHref === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-[#3b82f6] text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/portal"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">My Account</span>
          </Link>

          <Link
            href="/store/cart"
            className="relative flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <ShoppingCart className="w-4 h-4 text-white" />
            <span className="text-sm text-white font-medium hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#3b82f6] text-white text-[10px] font-bold flex items-center justify-center">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-white/[0.06] bg-[#080c10]/95 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active = currentHref === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-[#3b82f6] text-white"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
