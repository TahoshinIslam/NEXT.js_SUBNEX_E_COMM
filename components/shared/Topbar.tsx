"use client";

import { signOut } from "next-auth/react";
import { LogOut, Bell } from "lucide-react";
import { getInitials } from "@/lib/utils";

interface TopbarProps {
  user: {
    name?: string | null;
    email: string;
    orgName: string;
  };
}

export function Topbar({ user }: TopbarProps) {
  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 shrink-0">
      <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {user.orgName}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
            {getInitials(user.name ?? user.email)}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-none">{user.name ?? "Admin"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
