"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3, Users, CreditCard, RefreshCw,
  Bell, Settings, Package, LayoutDashboard, Store, MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/subscriptions", label: "Subscriptions", icon: Package },
  { href: "/renewals", label: "Renewals", icon: RefreshCw },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/testimonials", label: "Testimonials", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[var(--sidebar-width)] h-full flex flex-col bg-card border-r border-border shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-lg tracking-tight">SubTrack</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Store link */}
      <div className="px-3 pb-2">
        <a
          href="/store"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        >
          <Store className="w-4 h-4 shrink-0" />
          View Storefront ↗
        </a>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border">
        <p className="text-xs text-muted-foreground">SubTrack v0.1.0</p>
      </div>
    </aside>
  );
}
