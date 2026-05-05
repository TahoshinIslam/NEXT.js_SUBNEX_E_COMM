"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, ShoppingBag, Package, LogOut, User } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

interface PortalNavProps {
  account: { name: string; email: string } | null;
}

export function PortalNav({ account }: PortalNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/portal/auth/logout", { method: "POST" });
    router.push("/portal/login");
    router.refresh();
  }

  const navLinks = account
    ? [
        { href: "/portal/dashboard", label: "Dashboard", icon: User },
        { href: "/portal/orders", label: "My Orders", icon: ShoppingBag },
        { href: "/portal/subscriptions", label: "My Subscriptions", icon: Package },
      ]
    : [];

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#080c10]/80 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/store" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-[#3b82f6]/20 border border-[#3b82f6]/30 flex items-center justify-center">
              <BarChart3 className="w-3.5 h-3.5 text-[#3b82f6]" />
            </div>
            <span className="font-bold text-white text-base">SubTrack</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors",
                  pathname.startsWith(href)
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {account ? (
            <>
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07]">
                <div className="w-6 h-6 rounded-full bg-[#3b82f6]/20 border border-[#3b82f6]/30 flex items-center justify-center text-[10px] font-bold text-[#3b82f6]">
                  {getInitials(account.name)}
                </div>
                <span className="text-sm text-white/70 hidden sm:inline">{account.name}</span>
              </div>
              <button
                onClick={logout}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/portal/login"
                className="px-3 py-1.5 text-sm text-white/50 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/store"
                className="px-3 py-1.5 rounded-lg bg-[#3b82f6] text-white text-sm font-medium hover:bg-[#2563eb] transition-colors"
              >
                Browse Store
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
